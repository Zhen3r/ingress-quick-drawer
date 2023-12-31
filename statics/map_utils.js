DRAW_PARAMS = {
    portal: {
        radius: 5,
        color: '#3388ff',
        weight: 1,
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

        this.portal_num=0;
        this.link_num=0;
        this.field_num=0;
    }

    add_portal(portal) {
        let item = $("<li/>", {
            class: "list-group-item",
        })
        for (const [key, value] of Object.entries(portal)) {
            item.append("<p class='mb-0'>" + key + ": " + value + "</p>" );
        }
        this.portal_list.append(item);
    }

    add_link(link) {
        let item = $("<li/>", {
            class: "list-group-item",
        })
        item.append("<p class='mb-0'>from: "+link.from.name+"</p>")
        item.append("<p class='mb-0'>to: "+link.to.name+"</p>")
        this.link_list.append(item);
    }

    add_field(field) {
        let item = $("<li/>", {
            class: "list-group-item",
        })
        item.append("<p class='mb-0'>portal: "+field.portals[0].name+"</p>")
        item.append("<p class='mb-0'>portal: "+field.portals[1].name+"</p>")
        item.append("<p class='mb-0'>portal: "+field.portals[2].name+"</p>")
        // for (const [key, value] of Object.entries(field)) {
        //     item.append("<p class='mb-0'>" + key + ": " + value + "</p>" );
        // }
        this.field_list.append(item);
    }
    
    update_portal_num(n) {
        this.portal_num_element.text(n);
    }

    add_link_num() {
        this.link_num += 1;
        this.link_num_element.text(this.link_num);
    }

    add_field_num() {
        this.field_num += 1;
        this.field_num_element.text(this.field_num);
    }
}


class Drawer{
    constructor(map, marker_onclick) {
        this.map = map;
        this.marker_onclick = marker_onclick;
        this.InfoDisplayer = new InfoDisplayer()
    }
    
    draw_portals(portals) {
        portals.forEach((portal) => {
            let options = DRAW_PARAMS.portal;
            options.portal = portal;
            L.circleMarker(
                [portal.lat, portal.lng],
                options,
            ).on('click', this.marker_onclick).addTo(this.map);
            this.InfoDisplayer.add_portal(portal);
        })
        this.InfoDisplayer.update_portal_num(portals.length);
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
        ).addTo(this.map);
        this.InfoDisplayer.add_link_num();
        this.InfoDisplayer.add_link(link);
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
        ).addTo(this.map);
        this.InfoDisplayer.add_field_num();
        this.InfoDisplayer.add_field(field);
    }

    update_portal(portal) {
        // todo
    }
    
    display_log(log) {
        // todo
    }
    
    display_stats() {
        // todo
    }
    
    clear_portal(log) {
        // todo
    }
    
    clear_link(link) {
        // todo
    }
    
    clear_field(field) {
        // todo
    }
    
    clear_log(log) {
        // todo
    }
    
}

