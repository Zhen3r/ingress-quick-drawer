
// init leaflet
var map = L.map('map').setView([ 31.28087,121.585825], 18);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom:19,
    maxZoom:22,
}).addTo(map);


// load portals
let portals_csv_url = "./tmp/portals.csv"
let portals_csv = $.ajax({
    url: portals_csv_url,
    async: false,
}).responseText;
let portals = Papa.parse(portals_csv, {header: true}).data




let clicked_portal = null;

function marker_onclick(e) {
    if (clicked_portal == null) {
        clicked_portal = e.target;
        clicked_portal.setStyle({color: '#ff0000'});
    } else {
        let from_portal = clicked_portal;
        let to_portal = e.target;
        originator.add_link(from_portal.options.portal, to_portal.options.portal);
        clicked_portal.setStyle({color: '#3388ff'});
        e.target.setStyle({color: '#3388ff'});
        clicked_portal = null;
    }
}

let care_taker = new CareTaker();
let drawer = new Drawer(map, marker_onclick);
let originator = new ElementOriginator(drawer);

let portals_info = [];

portals.forEach(function (portal) {
    let portal_info = {
        id: portal.id,
        name: portal.name,
        lat: parseFloat(portal.lat),
        lng: parseFloat(portal.lng),
        start_num: 0,
        end_num: 0,
    };
    portals_info.push(portal_info);
});

originator.add_portals(portals_info);

originator.add_link(portals_info[0], portals_info[1]);
originator.add_link(portals_info[0], portals_info[2]);
originator.add_link(portals_info[8], portals_info[1]);
originator.add_link(portals_info[8], portals_info[2]);

originator.add_link(portals_info[0], portals_info[8]);

// originator.add_link(portals_info[1], portals_info[2]);




