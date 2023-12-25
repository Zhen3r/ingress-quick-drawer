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


class Drawer{
    constructor(map, marker_onclick) {
        this.map = map;
        this.marker_onclick = marker_onclick;
    }
    
    draw_portal(portal) {
        let options = DRAW_PARAMS.portal;
        options.portal = portal;
        L.circleMarker(
            [portal.lat, portal.lng],
            options,
        ).on('click', this.marker_onclick).addTo(this.map);
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

