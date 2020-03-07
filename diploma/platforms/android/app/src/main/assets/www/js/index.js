// defs
var PointCoordinates = /** @class */ (function () {
    function PointCoordinates(x, y) {
        this.x = x;
        this.y = y;
    }
    return PointCoordinates;
}());
var Network = /** @class */ (function () {
    function Network(buildings, lines, maxId) {
        if (buildings === void 0) { buildings = new Map(); }
        if (lines === void 0) { lines = new Map(); }
        if (maxId === void 0) { maxId = 0; }
        this.buildings = buildings;
        this.lines = lines;
        this.maxId = maxId;
    }
    return Network;
}());
var Building = /** @class */ (function () {
    function Building(id, coordinates, type) {
        this.id = id;
        this.coordinates = coordinates;
        this.type = type;
    }
    return Building;
}());
(function (Building) {
    var Type;
    (function (Type) {
        Type[Type["SUB_STATION"] = 0] = "SUB_STATION";
        Type[Type["ZTP"] = 1] = "ZTP";
        Type[Type["RP"] = 2] = "RP";
        Type[Type["PILLAR"] = 3] = "PILLAR";
        Type[Type["RECLOSER"] = 4] = "RECLOSER";
        Type[Type["DELIMITER"] = 5] = "DELIMITER";
        Type[Type["TPN"] = 6] = "TPN";
    })(Type = Building.Type || (Building.Type = {}));
})(Building || (Building = {}));
var Line = /** @class */ (function () {
    function Line(id, point1Coordinates, point2Coordinates, type) {
        this.id = id;
        this.point1Coordinates = point1Coordinates;
        this.point2Coordinates = point2Coordinates;
        this.type = type;
    }
    return Line;
}());
(function (Line) {
    var Type;
    (function (Type) {
        Type[Type["AIR"] = 0] = "AIR";
        Type[Type["CABLE"] = 1] = "CABLE";
    })(Type = Line.Type || (Line.Type = {}));
})(Line || (Line = {}));
var AddingObject;
(function (AddingObject) {
    AddingObject[AddingObject["ZTP"] = 0] = "ZTP";
    AddingObject[AddingObject["RP"] = 1] = "RP";
    AddingObject[AddingObject["SUB_STATION"] = 2] = "SUB_STATION";
    AddingObject[AddingObject["TPN"] = 3] = "TPN";
    AddingObject[AddingObject["RECLOSER"] = 4] = "RECLOSER";
    AddingObject[AddingObject["DELIMITER"] = 5] = "DELIMITER";
    AddingObject[AddingObject["PILLAR"] = 6] = "PILLAR";
    AddingObject[AddingObject["AIR_LINE"] = 7] = "AIR_LINE";
    AddingObject[AddingObject["CABLE_LINE"] = 8] = "CABLE_LINE";
    AddingObject[AddingObject["NONE"] = 9] = "NONE";
    AddingObject[AddingObject["DELETE"] = 10] = "DELETE";
})(AddingObject || (AddingObject = {}));
// end defs
var Leaflet = window['L'];
var editMode = false;
var addingObject = AddingObject.NONE;
var linePoint1;
var linePoint2;
var map = Leaflet.map('map').setView([55.75, 37.62], 15);
var objectLayer = Leaflet.layerGroup().addTo(map);
var SUB_STATION_ICON = Leaflet.icon({
    iconUrl: './img/subStationIcon.svg',
    iconAnchor: [15, 15]
});
var RP_ICON = Leaflet.icon({
    iconUrl: './img/rpIcon.svg',
    iconAnchor: [15, 15]
});
var RECLOSER_ICON = Leaflet.icon({
    iconUrl: './img/recloserIcon.svg',
    iconAnchor: [10, 10]
});
var DELIMITER_ICON = Leaflet.icon({
    iconUrl: './img/delimiterIcon.svg',
    iconAnchor: [10, 10]
});
var TPN_ICON = Leaflet.icon({
    iconUrl: './img/tpnIcon.svg',
    iconAnchor: [10, 10]
});
var ZTP_ICON = Leaflet.icon({
    iconUrl: './img/ztpIcon.svg',
    iconAnchor: [10, 10]
});
var PILLAR_ICON = Leaflet.icon({
    iconUrl: './img/pillarIcon.svg',
    iconAnchor: [4, 4]
});
var network = new Network();
// init map layers
Leaflet.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZ3V0bmlrIiwiYSI6ImNrMHFueDJtMTAzajIzbW1zdDhlaDVzMHIifQ.RDnM26fzP33nwDI74OWHWA'
}).addTo(map);
Leaflet.tileLayer('http://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?opacity={opacity}&fill_bound={fillBound}&palette={palette}&appid={appid}', {
    maxZoom: 18,
    appid: '4c4301a166b52aaee0e09e7f6169e80c',
    opacity: 1,
    fillBound: true,
    palette: '0:FF0000;100:00FF00;200:0000FF'
}).addTo(map);
var locationMarker = Leaflet.marker([0.0, 0.0]);
var circle = Leaflet.circle([0.0, 0.0], 0).addTo(map);
locationMarker.addTo(map);
document.addEventListener("deviceready", onDeviceReady, false);
var PATH = "file:///storage/emulated/0";
var resolveLocalFileSystemURL;
var chooser;
function onDeviceReady() {
    chooser = window['chooser'];
    resolveLocalFileSystemURL = window['resolveLocalFileSystemURL'];
    resolveLocalFileSystemURL(PATH, function (dir) {
        dir.getDirectory("Diploma", { create: true }, function (dir) { });
    });
    PATH = "file:///storage/emulated/0/Diploma";
}
// def methods
map.on('click', onMapClick);
map.on('locationfound', onLocationFound);
map.locate({ watch: true, setView: false });
function saveFile(createNew) {
    var json = JSON.stringify(network, function (key, value) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries())
            };
        }
        else {
            return value;
        }
    });
    if (createNew) {
        var fileName_1 = prompt("Введите имя файла для сохранения") + ".json";
        resolveLocalFileSystemURL(PATH, function (dir) {
            dir.getFile(fileName_1, { create: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onerror = function (e) {
                        alert("Failed file write: " + e.toString());
                    };
                    var dataObj = new Blob([json], { type: 'text/plain' });
                    fileWriter.write(dataObj);
                });
            });
        });
    }
    else {
        chooser
            .getFile()
            .then(function (file) {
            resolveLocalFileSystemURL(PATH, function (dir) {
                dir.getFile(file.name, { create: true }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onerror = function (e) {
                            alert("Failed file write: " + e.toString());
                        };
                        var dataObj = new Blob([json], { type: 'text/plain' });
                        fileWriter.write(dataObj);
                    });
                });
            });
        });
    }
}
function readNetworkFromFile() {
    chooser
        .getFile()
        .then(function (file) {
        resolveLocalFileSystemURL(PATH, function (dir) {
            dir.getFile(file.name, { create: true }, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onerror = function (e) {
                        alert("Error: " + e.toString());
                    };
                    reader.onloadend = function (e) {
                        loadNetwork(this.result.toString());
                    };
                    reader.readAsText(file);
                });
            });
        });
    });
}
function loadNetwork(networkData) {
    network = JSON.parse(networkData, function (key, value) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
        else {
            return value;
        }
    });
    objectLayer.clearLayers();
    network.buildings.forEach(function (building, id) {
        switch (building.type) {
            case Building.Type.RP:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: RP_ICON,
                    id: building.id,
                    type: Building.Type.RP
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
                break;
            case Building.Type.SUB_STATION:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: SUB_STATION_ICON,
                    id: building.id,
                    type: Building.Type.SUB_STATION
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
                break;
            case Building.Type.RECLOSER:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: RECLOSER_ICON,
                    id: building.id,
                    type: Building.Type.RECLOSER
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
                break;
            case Building.Type.DELIMITER:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: DELIMITER_ICON,
                    id: building.id,
                    type: Building.Type.DELIMITER
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
                break;
            case Building.Type.TPN:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: TPN_ICON,
                    id: building.id,
                    type: Building.Type.TPN
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
                break;
            case Building.Type.ZTP:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: ZTP_ICON,
                    id: building.id,
                    type: AddingObject.ZTP
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
                break;
            case Building.Type.PILLAR:
                Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                    icon: PILLAR_ICON,
                    id: building.id,
                    type: AddingObject.PILLAR
                }).on('click', onObjectClick)
                    .addTo(objectLayer);
        }
    });
    network.lines.forEach(function (line, id) {
        switch (line.type) {
            case Line.Type.AIR:
                Leaflet.polyline([
                    [line.point1Coordinates.x, line.point1Coordinates.y],
                    [line.point2Coordinates.x, line.point2Coordinates.y]
                ], {
                    color: "green",
                    weight: '2',
                    dashArray: '5, 4',
                    id: line.id,
                    type: Line.Type.AIR
                }).on('click', onObjectClick).addTo(objectLayer);
                break;
            case Line.Type.CABLE:
                Leaflet.polyline([
                    [line.point1Coordinates.x, line.point1Coordinates.y],
                    [line.point2Coordinates.x, line.point2Coordinates.y]
                ], {
                    color: "green",
                    weight: '2',
                    id: line.id,
                    type: Line.Type.CABLE
                }).on('click', onObjectClick).addTo(objectLayer);
                break;
        }
    });
}
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    locationMarker.setLatLng(e.latlng).update();
    circle.setLatLng(e.latlng).setRadius(radius);
}
function toggleMode() {
    if (editMode) {
        document.getElementById("switchModeButton").style.borderBottom = "none";
        setEditButtonsBorders("none");
        setEditButtonsDisplay("none");
        addingObject = AddingObject.NONE;
    }
    else {
        document.getElementById("switchModeButton").style.borderBottom = "5px solid #8de3e3";
        setEditButtonsDisplay("inline-block");
    }
    editMode = !editMode;
}
function addSubStation() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.SUB_STATION) {
        addingObject = AddingObject.SUB_STATION;
        document.getElementById("addSubStationButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addRp() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.RP) {
        addingObject = AddingObject.RP;
        document.getElementById("addRpButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addRecloser() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.RECLOSER) {
        addingObject = AddingObject.RECLOSER;
        document.getElementById("addRecloserButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addDelimiter() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.DELIMITER) {
        addingObject = AddingObject.DELIMITER;
        document.getElementById("addDelimiterButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addTpn() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.TPN) {
        addingObject = AddingObject.TPN;
        document.getElementById("addTpnButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addZtp() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.ZTP) {
        addingObject = AddingObject.ZTP;
        document.getElementById("addZtpButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addPillar() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.PILLAR) {
        addingObject = AddingObject.PILLAR;
        document.getElementById("addPillarButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addAirLine() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.AIR_LINE) {
        addingObject = AddingObject.AIR_LINE;
        document.getElementById("addAirLineButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function addCableLine() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.CABLE_LINE) {
        addingObject = AddingObject.CABLE_LINE;
        document.getElementById("addCableLineButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function deleteObject() {
    setEditButtonsBorders("none");
    if (addingObject != AddingObject.DELETE) {
        addingObject = AddingObject.DELETE;
        document.getElementById("binButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingObject = AddingObject.NONE;
    }
}
function setEditButtonsBorders(borderStyle) {
    Array
        .from(document.getElementsByClassName("editButton"))
        .forEach(function (element) {
        element.style.borderBottom = borderStyle;
    });
}
function setEditButtonsDisplay(display) {
    Array
        .from(document.getElementsByClassName("editButton"))
        .forEach(function (element) {
        element.style.display = display;
    });
}
function onMapClick(e) {
    if (editMode) {
        var buildingMarker;
        switch (addingObject) {
            case AddingObject.SUB_STATION:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: SUB_STATION_ICON,
                    id: ++network.maxId,
                    type: Building.Type.SUB_STATION
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.SUB_STATION));
                break;
            case AddingObject.RP:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: RP_ICON,
                    id: ++network.maxId,
                    type: Building.Type.RP
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.RP));
                break;
            case AddingObject.RECLOSER:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: RECLOSER_ICON,
                    id: ++network.maxId,
                    type: Building.Type.RECLOSER
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.RECLOSER));
                break;
            case AddingObject.DELIMITER:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: DELIMITER_ICON,
                    id: ++network.maxId,
                    type: Building.Type.DELIMITER
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.DELIMITER));
                break;
            case AddingObject.TPN:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: TPN_ICON,
                    id: ++network.maxId,
                    type: Building.Type.TPN
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.TPN));
                break;
            case AddingObject.ZTP:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: ZTP_ICON,
                    id: ++network.maxId,
                    type: Building.Type.ZTP
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.ZTP));
                break;
            case AddingObject.PILLAR:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: PILLAR_ICON,
                    id: ++network.maxId,
                    type: Building.Type.PILLAR
                }).on('click', onObjectClick);
                network.buildings.set(network.maxId, new Building(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng), Building.Type.PILLAR));
                break;
            default: break;
        }
        if (buildingMarker) {
            buildingMarker.addTo(objectLayer);
        }
    }
}
function onObjectClick() {
    switch (addingObject) {
        case AddingObject.DELETE:
            map.removeLayer(this);
            switch (this.options.type) {
                case Building.Type.TPN:
                case Building.Type.ZTP:
                case Building.Type.PILLAR:
                case Building.Type.SUB_STATION:
                case Building.Type.RP:
                case Building.Type.DELIMITER:
                case Building.Type.RECLOSER:
                    network.buildings.delete(this.options.id);
                    break;
                case Line.Type.AIR:
                case Line.Type.CABLE:
                    network.lines.delete(this.options.id);
                    break;
            }
            break;
        case AddingObject.AIR_LINE:
            if (!linePoint1) { // point 1 is undefined
                linePoint1 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
            }
            else {
                linePoint2 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
                Leaflet.polyline([
                    [linePoint1.x, linePoint1.y],
                    [linePoint2.x, linePoint2.y]
                ], {
                    color: "green",
                    weight: '2',
                    dashArray: '5, 4',
                    id: ++network.maxId,
                    type: Line.Type.AIR
                }).on('click', onObjectClick).addTo(map);
                network.lines.set(network.maxId, new Line(network.maxId, linePoint1, linePoint2, Line.Type.AIR));
                linePoint1 = undefined;
                linePoint2 = undefined;
            }
            break;
        case AddingObject.CABLE_LINE:
            if (!linePoint1) { // point 1 is undefined
                linePoint1 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
            }
            else {
                linePoint2 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
                Leaflet.polyline([
                    [linePoint1.x, linePoint1.y],
                    [linePoint2.x, linePoint2.y]
                ], {
                    color: "green",
                    weight: '2',
                    id: ++network.maxId,
                    type: Line.Type.CABLE
                }).on('click', onObjectClick).addTo(map);
                network.lines.set(network.maxId, new Line(network.maxId, linePoint1, linePoint2, Line.Type.AIR));
                linePoint1 = undefined;
                linePoint2 = undefined;
            }
            break;
    }
}
//# sourceMappingURL=index.js.map