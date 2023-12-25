// portal like: {"id": "id1", "name": "name1", "lat": "31.28087", "lng": "121.585825", "start_num": 0, "end_num": 0}
// link like: {"id": "id1", "from": portal1, "to": portal2}
// field like: {"id": "id1", "portals": [portal1, portal2, portal3]}
// log like: {"id": "1", "type": "link", "data": {"id": "1", "from": portal1, "to": portal2}}
// log like: {"id": "2", "type": "go", "data": {"id": "1", "from": portal1, "to": portal2}}

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

    add_portal(portal) {
        this.state.portals.push(portal);
        this.drawer.draw_portal(portal);
    }

    verify_potential_link(from_portal, to_portal) {
        // TODO
        // showAlert("Invalid link", "danger");
        // return false
        return true
    }

    add_link(from_portal, to_portal) {
        if (!this.verify_potential_link(from_portal, to_portal)) {
            return;
        }
        let link_info = {
            id: "L-" + this.state.links.length,
            from: from_portal,
            to: to_portal,
        };
        this.state.links.push(link_info);
        this.drawer.draw_link(link_info);
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
        drawer.draw(this.state);
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







