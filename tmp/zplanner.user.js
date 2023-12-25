console.log('zplanner.user.js loaded')


function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if(typeof window.plugin !== 'function') window.plugin = function() {};
    

    var zplanner = {
        "toggled": false,
    };
    window.plugin.zplanner = zplanner;


    function draw(ev) {
        var point = ev.layerPoint;
        var fields = window.fields;
        console.log(ev);
        console.log(ev.target);
        console.log('draw', point, fields);
    }


    function setup() {
        let zplanner_toolbox = `\
        <div class="leaflet-control-zplanner leaflet-bar leaflet-control">
            <a class="leaflet-bar-part" title="Count nested fields" style="">
                <div class="leaflet-control-zplanner-tooltip">
                    Z
                </div>
            </a>
        </div>
        `
        function zplanner_toolbox_click() {
            console.log('zplanner_toolbox_click, toggled:', zplanner.toggled);
            zplanner.toggled = !zplanner.toggled;
            if (zplanner.toggled) {
                window.map.on('click', draw);
                // let all_markers = window.layerGroup.getLayers();
            } else {
                window.map.off('click', draw);
            }
        } 
        zplanner_toolbox = $.parseHTML(zplanner_toolbox);
        $(zplanner_toolbox).click(zplanner_toolbox_click);
        let zll = $("div.leaflet-left")[0];
        $(zll).append(zplanner_toolbox);
    }



    setup.info = plugin_info; //add the script info data to the function as a property
    if (typeof changelog !== 'undefined') setup.info.changelog = changelog;
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);

