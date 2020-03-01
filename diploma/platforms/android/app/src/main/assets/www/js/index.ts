// defs
class PointCoordinates {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}
class Network {
    id: String
    subStations: Array<SubStation>
    rps: Array<Rp>
    reclosers: Array<Recloser>
    delimiters: Array<Delimiter>
    ztps: Array<Ztp>
    tpns: Array<Tpn>
    pillars: Array<Pillar>
    constructor(
        id: String, 
        subStations: Array<SubStation> = new Array(),
        rps: Array<Rp> = new Array(),
        reclosers: Array<Recloser> = new Array(),
        delimiters: Array<Delimiter> = new Array(),
        ztps: Array<Ztp> = new Array(),
        tpns: Array<Tpn> = new Array(),
        pillars: Array<Pillar> = new Array()
    ) {
        this.id = id
        this.subStations = subStations
        this.rps = rps
        this.reclosers = reclosers
        this.delimiters = delimiters
        this.ztps = ztps
        this.tpns = tpns
        this.pillars = pillars
    }
}
class Building {
    coordinates: PointCoordinates
    constructor(coordinates: PointCoordinates) {
        this.coordinates = coordinates
    }
}
class SubStation extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
class Ztp extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
class Pillar extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
class Recloser extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
class Delimiter extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
class Tpn extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
class Rp extends Building {
    constructor(coordinates: PointCoordinates) {
        super(coordinates)
    }
}
const Leaflet = window['L']
var editMode = false
enum AddingBuilding {
    ZTP,
    RP,
    SUB_STATION,
    TPN,
    RECLOSER,
    DELIMITER,
    NONE,
    DELETE
}
var addingBuilding: AddingBuilding = AddingBuilding.NONE
const map = Leaflet.map('map').setView([55.75, 37.62], 15);
const objectLayer = Leaflet.layerGroup().addTo(map)
const tpnIcon = Leaflet.icon(
    {
        iconUrl: './img/tpnIcon.svg',
        iconAnchor: [10, 10]
    }
)
const ztpIcon = Leaflet.icon(
    {
        iconUrl: './img/ztpIcon.svg',
        iconAnchor: [10, 10]
    }
)
var network = new Network(
    "network1"
)

// init map layers
Leaflet.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', 
    {
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZ3V0bmlrIiwiYSI6ImNrMHFueDJtMTAzajIzbW1zdDhlaDVzMHIifQ.RDnM26fzP33nwDI74OWHWA'
    }
).addTo(map);
Leaflet.tileLayer(
    'http://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?opacity={opacity}&fill_bound={fillBound}&palette={palette}&appid={appid}',
    {
        maxZoom: 18,
        appid: '4c4301a166b52aaee0e09e7f6169e80c',
        opacity: 1,
        fillBound: true,
        palette: '0:FF0000;100:00FF00;200:0000FF'
    }
).addTo(map);
var locationMarker = Leaflet.marker([0.0, 0.0])
var circle = Leaflet.circle([0.0, 0.0], 0).addTo(map)
locationMarker.addTo(map)

document.addEventListener("deviceready", onDeviceReady, false);
const PATH = "file:///storage/emulated/0";
var resolveLocalFileSystemURL
var chooser

function onDeviceReady() {
    chooser = window['chooser']
    resolveLocalFileSystemURL = window['resolveLocalFileSystemURL']
    chooser.getFile()
        .then(
            file => {
                alert(JSON.stringify(file))
                resolveLocalFileSystemURL(PATH, function(dir) {
                    dir.getFile(file.name, {create:true}, function(fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader();
                            reader.onerror = function(e) {
                                alert("Error: " + e.toString())
                            }
                            reader.onloadend = function(e) {
                                loadNetwork(this.result.toString())
                            }
                            reader.readAsText(file)
                        });
                    });
                });
            }
        )
}


// def methods
map.on('click', onMapClick)
map.on('locationfound', onLocationFound)
map.locate({watch: true, setView: false})

function saveFile() {
    chooser.getFile()
        .then(
            file => {
                resolveLocalFileSystemURL(PATH, function(dir) {
                    dir.getFile(file.name, {create:true}, function(fileEntry) {
                        let json = JSON.stringify(network)
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onerror = function (e) {
                                alert("Failed file write: " + e.toString());
                            };
                            const dataObj = new Blob([json], { type: 'text/plain' });
                    
                            fileWriter.write(dataObj);
                        });
                    });
                });
            }
        )
}

function loadNetwork(networkData: string) {
    let network: Network = JSON.parse(networkData)
    objectLayer.clearLayers()
    network.ztps.forEach(
        ztp => {
            let buildingMarker = Leaflet.marker(
                [ztp.coordinates.x, ztp.coordinates.y],
                {
                    icon: ztpIcon
                }
            ).on('click', onObjectClick)
            buildingMarker.addTo(objectLayer)
        }
    )
    network.tpns.forEach(
        tpn => {
            let buildingMarker = Leaflet.marker(
                [tpn.coordinates.x, tpn.coordinates.y],
                {
                    icon: tpnIcon
                }
            ).on('click', onObjectClick)
            buildingMarker.addTo(objectLayer)
        }
    )
}

function onLocationFound(e) {
    var radius = e.accuracy / 2
    locationMarker.setLatLng(e.latlng).update()
    circle.setLatLng(e.latlng).setRadius(radius)
}

function toggleMode() {
    if (editMode) {
        document.getElementById("switchModeButton").style.borderBottom = "none"
        setEditButtonsBorders("none")
        setEditButtonsDisplay("none")
        addingBuilding = AddingBuilding.NONE
    } else {
        document.getElementById("switchModeButton").style.borderBottom = "5px solid #8de3e3"
        setEditButtonsDisplay("inline-block")
    }
    editMode = !editMode
}

function addTpn() {
    setEditButtonsBorders("none")
    if (addingBuilding != AddingBuilding.TPN) {
        addingBuilding = AddingBuilding.TPN
        document.getElementById("addTpnButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingBuilding = AddingBuilding.NONE
    }
}

function addZtp() {
    setEditButtonsBorders("none")
    if (addingBuilding != AddingBuilding.ZTP) {
        addingBuilding = AddingBuilding.ZTP
        document.getElementById("addZtpButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingBuilding = AddingBuilding.NONE
    }
}

function deleteObject() {
    setEditButtonsBorders("none")
    if (addingBuilding != AddingBuilding.DELETE) {
        addingBuilding = AddingBuilding.DELETE
        document.getElementById("binButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingBuilding = AddingBuilding.NONE
    }
}

function setEditButtonsBorders(borderStyle: String) {
    Array
        .from(document.getElementsByClassName("editButton"))
        .forEach((element: any) => {
            element.style.borderBottom = borderStyle
        });
}

function setEditButtonsDisplay(display: String) {
    Array
        .from(document.getElementsByClassName("editButton"))
        .forEach((element: any) => {
            element.style.display = display
        });
}

function onMapClick(e) {
    if (editMode) {
        var buildingMarker
        switch (addingBuilding) {
            case AddingBuilding.TPN:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: tpnIcon
                    }
                ).on('click', onObjectClick)
                network.tpns.push(
                    new Tpn(
                        new PointCoordinates(e.latlng.lat, e.latlng.lng)
                    )
                )
                break
            case AddingBuilding.ZTP:
                buildingMarker = Leaflet.marker(
                    e.latlng,
                    {
                        icon: ztpIcon
                    }
                ).on('click', onObjectClick)
                network.ztps.push(
                    new Ztp(
                        new PointCoordinates(e.latlng.lat, e.latlng.lng)
                    )
                )
                break
            case AddingBuilding.DELETE:
                
                break
        }
        if (addingBuilding != AddingBuilding.NONE
            && addingBuilding != AddingBuilding.DELETE) {
                buildingMarker.addTo(objectLayer)
            }
    }
}

function onObjectClick() {
    if (addingBuilding == AddingBuilding.DELETE) {
        map.removeLayer(this)
    }
}