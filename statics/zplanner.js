
// init leaflet
var map = L.map('map').setView([ 31.28087,121.585825], 18);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// load portals
let portals_csv_url = "./tmp/portals.csv"
let portals_csv = $.ajax({
    url: portals_csv_url,
    async: false,
}).responseText;
let portals = Papa.parse(portals_csv, {header: true}).data
console.log(portals)




let clicked_portal = null;

function marker_onclick(e) {
    console.log(e.target.options.title);
    if (clicked_portal == null) {
        clicked_portal = e.target;
        e.target.setStyle({color: '#ff0000'});
    } else {
        let from_portal = clicked_portal;
        let to_portal = e.target;
        originator.add_link(from_portal, to_portal);
        clicked_portal.setStyle({color: '#3388ff'});
        e.target.setStyle({color: '#3388ff'});
        clicked_portal = null;
    }
}


let care_taker = new CareTaker();
let drawer = new Drawer(map, marker_onclick);
let originator = new ElementOriginator(drawer);

portals.forEach(function (portal) {
    let portal_info = {
        id: portal.id,
        name: portal.name,
        lat: portal.lat,
        lng: portal.lng,
        start_num: 0,
        end_num: 0,
    };
    originator.add_portal(portal_info);
});

first_3_portals = portals.slice(0, 3);
originator.add_field(...first_3_portals);
originator.add_link(first_3_portals[0], first_3_portals[1]);
originator.add_link(first_3_portals[1], first_3_portals[2]);




