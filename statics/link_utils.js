// portal like: {"id": "id1", "name": "name1", "lat": "31.28087", "lng": "121.585825", "start_num": 0, "end_num": 0}
// link like: {"id": "id1", "from": portal1, "to": portal2}
// field like: {"id": "id1", "portals": [portal1, portal2, portal3]}
// log like: {"id": "1", "type": "link", "data": {"id": "1", "from": portal1, "to": portal2}}
// log like: {"id": "2", "type": "go", "data": {"id": "1", "from": portal1, "to": portal2}}

TOLERANCE = 0.000000; // km

function showAlert(message, type) {
    var alertHtml = (''
        + '<div id="alert" class="container">'
        + '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">'
        + message
        + '</div></div>');
    $('#alertPlaceholder').html(alertHtml);
    setTimeout(function() {
        $('#alert').fadeOut('fast');
    }, 2000);
}


class ElementOriginator {
    constructor(drawer) {
        this.state = {
            portals: [],
            links: [],
            fields: [],
            logs: [],
        }
        this.drawer = drawer;
    }

    add_portals(portals) {
        this.state.portals.push(...portals)
        this.drawer.draw_portals(portals);
    }

    verify_potential_link(from_portal, to_portal) {
        // - when 2 portals are to be connected
        //     - check if they are the same
        if (from_portal.id == to_portal.id) {
            showAlert("不能连接同一个Portal", "danger");
            return false;
        }

        //     - check if they are already connected
        let from_portal_links = this.state.links.filter(link => link.from.id == from_portal.id || link.to.id == from_portal.id);
        let to_portal_links = this.state.links.filter(link => link.from.id == to_portal.id || link.to.id == to_portal.id);
        let common_links = from_portal_links.filter(link => to_portal_links.includes(link));
        if (common_links.length > 0) {
            showAlert("这两个Portal已经连接了", "danger");
            return false;
        }
        
        //     - check connection limit of portals
        let from_portal_link_num = from_portal.start_num;
        if (from_portal_link_num >= 8) {
            showAlert("这个Portal已经连接了8条线", "warning");
        }

        //     - calc the len of link
        let from_portal_latlng = L.latLng(from_portal.lat, from_portal.lng);
        let to_portal_latlng = L.latLng(to_portal.lat, to_portal.lng);
        let link_len = from_portal_latlng.distanceTo(to_portal_latlng);

        //     - check if the start portal is under field (that is, the point is in the rectangle of the field)
        //         - if yes, assert len of link <= 500m
        let all_fields = this.state.fields;
        for (let i = 0; i < all_fields.length; i++) {
            let field = all_fields[i];
            let [portal1, portal2, portal3] = field.portals;
            let portal1_latlng = L.latLng(portal1.lat, portal1.lng);
            let portal2_latlng = L.latLng(portal2.lat, portal2.lng);
            let portal3_latlng = L.latLng(portal3.lat, portal3.lng);
            let field_latlngs = [portal1_latlng, portal2_latlng, portal3_latlng];
            let polygon = L.polygon(field_latlngs);
            if (polygon.getBounds().contains(from_portal_latlng)) {
                if (link_len > 500) {
                    showAlert("这个Portal在Field内，不能连接超过500米的Portal", "danger");
                    return false;
                }
            }
        }

        //     - check if the new link cross existing links (with turf.js)
        let all_links = this.state.links;
        for (let i = 0; i < all_links.length; i++) {
            let link = all_links[i];
            let [portal1, portal2] = [link.from, link.to];
            let link1 = turf.lineString([[portal1.lng, portal1.lat], [portal2.lng, portal2.lat]]);
            let link2 = turf.lineString([[from_portal.lng, from_portal.lat], [to_portal.lng, to_portal.lat]]);

            let cross_points = turf.lineIntersect(link1, link2).features;
            if (cross_points.length == 0) {
                continue;
            }
            let first_cross_point = cross_points[0];
            let cross_point_to_portal1 = turf.distance(turf.point([portal1.lng, portal1.lat]), first_cross_point);
            let cross_point_to_portal2 = turf.distance(turf.point([portal2.lng, portal2.lat]), first_cross_point);

            if (cross_point_to_portal1 > TOLERANCE && cross_point_to_portal2 > TOLERANCE) {
                showAlert("这个Portal和已有的Portal连接线相交了", "danger");
                return false;
            }
        }
        return true;
    }

    add_link(from_portal, to_portal) {
        let verify_result = this.verify_potential_link(from_portal, to_portal);
        if (verify_result === false) {
            return;
        }

        // get left/right larget field, add fields
        // dfs search for new closed loop, loop length = 3
        // link is not oriented
        let new_fields = [];
        for (let i = 0; i < this.state.links.length; i++) {
            let tmp_link = this.state.links[i];
            let tmp_nodes = [tmp_link.from, tmp_link.to];
            let current_nodes = [from_portal, to_portal];
            let common_nodes = tmp_nodes.filter(node => {
                return current_nodes.filter(current_node => current_node.id == node.id).length > 0;
            })
            if (common_nodes.length != 1) {
                continue;
            }
            let far_node = tmp_nodes.filter(node => node.id != common_nodes[0].id)[0];
            let near_node = current_nodes.filter(node => node.id != common_nodes[0].id)[0];
            
            for (let j = 0; j < this.state.links.length; j++) {
                let tmp_link2 = this.state.links[j];
                if (tmp_link2.id == tmp_link.id) {
                    continue;
                }
                if (!(tmp_link2.from.id == far_node.id || tmp_link2.to.id == far_node.id)) {
                    continue;
                }
                let far_node2 = tmp_link2.from.id == far_node.id ? tmp_link2.to : tmp_link2.from;
                if (far_node2.id == near_node.id) {
                    new_fields.push([common_nodes[0], far_node, far_node2]);
                    break;
                }
            }
        }

        console.log("The new fields are:", new_fields);

        // determine the orientation(left/right) of the new field
        // for each orientation, choose the one with larger area
        let largest_fields = {left: {field: null, area: 0}, right: {field: null, area: 0}};
        new_fields.forEach(field => {
            let p1 = turf.point([from_portal.lng, from_portal.lat]);
            let p2 = turf.point([to_portal.lng, to_portal.lat]);
            let p3 = turf.point([field[1].lng, field[1].lat]);
            
            let bearingP1P2 = turf.bearing(p1, p2);
            let bearingP1P3 = turf.bearing(p1, p3);

            let theta = bearingP1P3 - bearingP1P2;
            theta = theta < 0 ? theta + 360 : theta;

            console.log(
                "bearing",
                from_portal.name, to_portal.name, field[1].name,
                bearingP1P2, bearingP1P3, theta
            )
            
            if (theta > 180) {
                // P3 is to the left of the line P1P2
                let left_field = turf.polygon([[p1.geometry.coordinates, p2.geometry.coordinates, p3.geometry.coordinates, p1.geometry.coordinates]]);
                let left_field_area = turf.area(left_field);
                if (left_field_area > largest_fields.left.area) {
                    largest_fields.left.field = field;
                    largest_fields.left.area = left_field_area;
                }
            } else if (theta < 180) {
                // P3 is to the right of the line P1P2
                let right_field = turf.polygon([[p1.geometry.coordinates, p2.geometry.coordinates, p3.geometry.coordinates, p1.geometry.coordinates]]);
                let right_field_area = turf.area(right_field);
                if (right_field_area > largest_fields.right.area) {
                    largest_fields.right.field = field;
                    largest_fields.right.area = right_field_area;
                }
            } else {
                // P3 is on the line P1P2
                // do nothing
                console.log("P3 is on the line P1P2");
                return;
            }
        });
        
        let left_field = largest_fields.left.field;
        let right_field = largest_fields.right.field;
        if (left_field != null) {
            this.add_field(left_field[0], left_field[1], left_field[2]);
        }
        if (right_field != null) {
            this.add_field(right_field[0], right_field[1], right_field[2]);
        }

        // add link to links
        let link_info = { id: "L-" + this.state.links.length,
            from: from_portal,
            to: to_portal,
        };
        this.state.links.push(link_info);
        this.drawer.draw_link(link_info);
        this.state.portals.forEach(portal => {
            if (portal.id == from_portal.id) {
                portal.start_num += 1;
            }
            if (portal.id == to_portal.id) {
                portal.end_num += 1;
            }
        });

        // update portals, stats, logs
        this.drawer.InfoDisplayer.update_stats(this.state);
    }

    add_field(portal1, portal2, portal3) {
        let field_info = {
            id: "F-" + this.state.fields.length,
            portals: [portal1, portal2, portal3],
        };
        this.state.fields.push(field_info);
        this.drawer.draw_field(field_info);
    }

    get_memento() {
        // deep copy
        return new Memento(JSON.parse(JSON.stringify(this.state)));
    }

    restore(memento) {
        this.state = memento.state;
        drawer.clear();
        drawer.from_state(this.state);
    }
}

class Memento {
    constructor(state) {
        this.state = state;
    }
}

class CareTaker {
    constructor() {
        this.mementos = [];
    }
    save() {
        this.mementos.push(originator.get_memento());
    }
    undo() {
        if (this.mementos.length > 0) {
            originator.restore(this.mementos.pop());
        } else {
            console.error("Nothing to undo");
        }
    }
}







