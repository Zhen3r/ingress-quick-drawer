DRAW_PARAMS = {
    portal: {
        radius: 13,
        color: '#3388ff',
        weight: 1.8,
        opacity: 1,
        smoothFactor: 1,
        interactive: true,
    },
    link: {
        color: '#3388ff',
        weight: 2,
        opacity: 0.7,
        smoothFactor: 1,
        interactive: false,
    },
    field: {
        color: '#3388ff',
        weight: 0,
        opacity: 0.5,
        smoothFactor: 1,
        interactive: false,
    },
}

class InfoDisplayer {
    constructor() {
        this.portal_list = $("#portal-list");
        this.link_list = $("#link-list");
        this.field_list = $("#field-list");

        this.portal_num_element = $("#portal-num");
        this.link_num_element = $("#link-num");
        this.field_num_element = $("#field-num");
    }

    add_portal(portal) {
        let item = $("<li/>", {
            class: "list-group-item",
        })
        // for (const [key, value] of Object.entries(portal)) {
        //     item.append("<p class='mb-0'>" + key + ": " + value + "</p>" );
        // }
        item.text(portal.name);
        item.append("&nbsp;&nbsp;");
        item.append("<span class='badge bg-secondary'>start: " + portal.start_num + "</span>");
        item.append("&nbsp;&nbsp;");
        item.append("<span class='badge bg-secondary'>end: " + portal.end_num + "</span>");
        this.portal_list.append(item);
    }

    add_link(link) {
        let item = $("<li/>", {
            class: "list-group-item",
            text: link.from.name + " -> " + link.to.name,
        })
        // item.append("<p class='mb-0'>from: "+link.from.name+"</p>")
        // item.append("<p class='mb-0'>to: "+link.to.name+"</p>")
        this.link_list.append(item);
    }

    add_field(field) {
        let item = $("<li/>", {
            class: "list-group-item",
        })
        item.append("<p class='mb-0'>portal: "+field.portals[0].name+"</p>")
        item.append("<p class='mb-0'>portal: "+field.portals[1].name+"</p>")
        item.append("<p class='mb-0'>portal: "+field.portals[2].name+"</p>")
        this.field_list.append(item);
    }
    
    set_obj_count(obj, n) {
        if (obj == "portal") {
            this.portal_num_element.text(n);
        } else if (obj == "link") {
            this.link_num_element.text(n);
        } else if (obj == "field") {
            this.field_num_element.text(n);
        } else {
            console.log("Error: unknown obj", obj);
        }
    }

    update_stats(state) {
        this.set_obj_count("portal", state.portals.length);
        this.portal_list.empty();
        this.link_list.empty();
        this.field_list.empty();

        state.portals = state.portals.sort((b, a) => {
            return (a.start_num + a.end_num) - (b.start_num + b.end_num)
        });
        console.log(state.portals)

        state.portals.forEach((portal) => {
            this.add_portal(portal);
        });
        
        this.set_obj_count("link", state.links.length);
        state.links.forEach((link) => {
            this.add_link(link);
        });
        
        this.set_obj_count("field", state.fields.length);
        state.fields.forEach((field) => {
            this.add_field(field);
        });
    }

}


class Drawer{
    constructor(marker_onclick) {
        this.map = L.map('map').setView([ 31.28087,121.585825], 18);
        this.base_map = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxNativeZoom:19,
            maxZoom:22,
        }).addTo(this.map);
        this.map_layer_portal = L.layerGroup().addTo(this.map);
        this.map_layer_link = L.layerGroup().addTo(this.map);
        this.map_layer_field = L.layerGroup().addTo(this.map);
        this.map_layer_portal_info = L.layerGroup().addTo(this.map);

        let baseMaps = {
            "OpenStreetMap":this.base_map,
        };
        
        let overlayMaps = {
            "Portals": this.map_layer_portal,
            "Links": this.map_layer_link,
            "Fields": this.map_layer_field,
            "Portal Info": this.map_layer_portal_info,
        };

        var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(this.map);


        this.marker_onclick = marker_onclick;
        this.InfoDisplayer = new InfoDisplayer()
    }
    
    draw_portals(portals) {
        this.map.flyTo([portals[0].lat, portals[0].lng], 15);
        function customTip() {
            this.unbindTooltip();
            if (!this.isPopupOpen()) this.bindTooltip(this.options.portal.name, {
                direction: "top", offset: [0, -15], opacity: 0.8
            }).openTooltip();
        }
        
        function customPop() {
            this.unbindTooltip();
        }
        portals.forEach((portal) => {
            let options = DRAW_PARAMS.portal;
            options.portal = portal;
            L.circleMarker([portal.lat, portal.lng], options)
                .on('click', this.marker_onclick)
                .addTo(this.map_layer_portal)
                .on('mouseover', customTip)
                .on('mouseout', customPop);
            this.InfoDisplayer.add_portal(portal);
        });

        this.draw_portal_info(portals);
    }

    draw_portal_info(portals) {
        this.clear_portal_info();
        portals.forEach((portal) => {
            L.marker([portal.lat, portal.lng], {
                icon: L.divIcon({
                    className: 'text-labels',   // Set class for CSS styling
                    html: (
                        '<div>' + portal.name + '<br>' + 
                            '<span class="end_num">' + portal.end_num + '</span>' +
                            "<div class='space'></div>" +
                            '<span class="start_num">' + portal.start_num + '</span>' + 
                        '</div>'

                    ),
                }),
                interactive: false,
                zIndexOffset: 1000
            }).addTo(this.map_layer_portal_info);
        });
    }

    draw_link(link) {
        let portal1 = link.from;
        let portal2 = link.to;
        L.polyline(
            [
                [portal1.lat, portal1.lng],
                [portal2.lat, portal2.lng]
            ],
            DRAW_PARAMS.link
        ).addTo(this.map_layer_link);

    }

    draw_field(field) {
        let [portal1, portal2, portal3] = field.portals;
        L.polygon(
            [
                [portal1.lat, portal1.lng],
                [portal2.lat, portal2.lng],
                [portal3.lat, portal3.lng],
            ],
            DRAW_PARAMS.field
        ).addTo(this.map_layer_field);

    }



    clear_portal() {
        this.map_layer_portal.clearLayers();
    }
    
    clear_link() {
        this.map_layer_link.clearLayers();
    }
    
    clear_field() {
        this.map_layer_field.clearLayers();
    }
    clear_portal_info() {
        this.map_layer_portal_info.clearLayers();
    }

    clear() {
        // this.clear_portal();
        this.clear_link();
        this.clear_field();
    }

    from_state(state) {
        // this.draw_portals(state.portals);
        this.draw_portal_info(state.portals);
        state.links.forEach((link) => {
            this.draw_link(link);
        });
        state.fields.forEach((field) => {
            this.draw_field(field);
        });
        this.InfoDisplayer.update_stats(state);
    }

    destroy() {
        this.map.remove();
    }
}

