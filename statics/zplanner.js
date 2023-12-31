
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
        care_taker.save();
        let from_portal = clicked_portal;
        let to_portal = e.target;
        originator.add_link(from_portal.options.portal, to_portal.options.portal);
        clicked_portal.setStyle({color: '#3388ff'});
        e.target.setStyle({color: '#3388ff'});
        clicked_portal = null;
    }
}

let care_taker = new CareTaker();
let drawer = new Drawer(marker_onclick);
let originator = new ElementOriginator(drawer);


$("#undo").on("click", function () {
    care_taker.undo();
});



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

// care_taker.save();
// originator.add_link(portals_info[0], portals_info[1]);
// care_taker.save();
// originator.add_link(portals_info[0], portals_info[2]);
// care_taker.save();
// originator.add_link(portals_info[8], portals_info[1]);
// care_taker.save();
// originator.add_link(portals_info[8], portals_info[2]);
// care_taker.save();
// originator.add_link(portals_info[0], portals_info[8]);
// care_taker.save();
// originator.add_link(portals_info[1], portals_info[2]);

let [p1, p2, p3, p4] = [1, 2, 4, 14];

care_taker.save();
originator.add_link(portals_info[p1], portals_info[p2]);
care_taker.save();
originator.add_link(portals_info[p1], portals_info[p3]);
care_taker.save();
originator.add_link(portals_info[p2], portals_info[p3]);
care_taker.save();
originator.add_link(portals_info[p4], portals_info[p3]);
care_taker.save();
originator.add_link(portals_info[p4], portals_info[p2]);
care_taker.save();
originator.add_link(portals_info[p4], portals_info[p1]);
