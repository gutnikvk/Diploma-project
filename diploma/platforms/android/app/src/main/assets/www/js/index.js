var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// defs
var PointCoordinates = /** @class */ (function () {
    function PointCoordinates(x, y) {
        this.x = x;
        this.y = y;
    }
    return PointCoordinates;
}());
var Network = /** @class */ (function () {
    function Network(id, subStations, rps, reclosers, delimiters, ztps, tpns, pillars, lines, maxId) {
        if (subStations === void 0) { subStations = new Map(); }
        if (rps === void 0) { rps = new Map(); }
        if (reclosers === void 0) { reclosers = new Map(); }
        if (delimiters === void 0) { delimiters = new Map(); }
        if (ztps === void 0) { ztps = new Map(); }
        if (tpns === void 0) { tpns = new Map(); }
        if (pillars === void 0) { pillars = new Map(); }
        if (lines === void 0) { lines = new Map(); }
        if (maxId === void 0) { maxId = 0; }
        this.id = id;
        this.subStations = subStations;
        this.rps = rps;
        this.reclosers = reclosers;
        this.delimiters = delimiters;
        this.ztps = ztps;
        this.tpns = tpns;
        this.pillars = pillars;
        this.lines = lines;
        this.maxId = maxId;
    }
    return Network;
}());
var Building = /** @class */ (function () {
    function Building(id, coordinates) {
        this.id = id;
        this.coordinates = coordinates;
    }
    return Building;
}());
var SubStation = /** @class */ (function (_super) {
    __extends(SubStation, _super);
    function SubStation(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return SubStation;
}(Building));
var Ztp = /** @class */ (function (_super) {
    __extends(Ztp, _super);
    function Ztp(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return Ztp;
}(Building));
var Pillar = /** @class */ (function (_super) {
    __extends(Pillar, _super);
    function Pillar(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return Pillar;
}(Building));
var Recloser = /** @class */ (function (_super) {
    __extends(Recloser, _super);
    function Recloser(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return Recloser;
}(Building));
var Delimiter = /** @class */ (function (_super) {
    __extends(Delimiter, _super);
    function Delimiter(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return Delimiter;
}(Building));
var Tpn = /** @class */ (function (_super) {
    __extends(Tpn, _super);
    function Tpn(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return Tpn;
}(Building));
var Rp = /** @class */ (function (_super) {
    __extends(Rp, _super);
    function Rp(id, coordinates) {
        return _super.call(this, id, coordinates) || this;
    }
    return Rp;
}(Building));
var Line = /** @class */ (function () {
    function Line(id, point1Coordinates, point2Coordinates) {
        this.id = id;
        this.point1Coordinates = point1Coordinates;
        this.point2Coordinates = point2Coordinates;
    }
    return Line;
}());
var AirLine = /** @class */ (function (_super) {
    __extends(AirLine, _super);
    function AirLine(id, point1Coordinates, point2Coordinates) {
        return _super.call(this, id, point1Coordinates, point2Coordinates) || this;
    }
    return AirLine;
}(Line));
var CableLine = /** @class */ (function (_super) {
    __extends(CableLine, _super);
    function CableLine(id, point1Coordinates, point2Coordinates) {
        return _super.call(this, id, point1Coordinates, point2Coordinates) || this;
    }
    return CableLine;
}(Line));
var Leaflet = window['L'];
var editMode = false;
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
var addingObject = AddingObject.NONE;
var linePoint1;
var linePoint2;
var map = Leaflet.map('map').setView([55.75, 37.62], 15);
var objectLayer = Leaflet.layerGroup().addTo(map);
var tpnIcon = Leaflet.icon({
    iconUrl: './img/tpnIcon.svg',
    iconAnchor: [10, 10]
});
var ztpIcon = Leaflet.icon({
    iconUrl: './img/ztpIcon.svg',
    iconAnchor: [10, 10]
});
var pillarIcon = Leaflet.icon({
    iconUrl: './img/pillarIcon.svg',
    iconAnchor: [4, 4]
});
var network = new Network("network1");
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
    if (createNew) {
        var fileName_1 = prompt("Введите имя файла для сохранения") + ".json";
        resolveLocalFileSystemURL(PATH, function (dir) {
            dir.getFile(fileName_1, { create: true }, function (fileEntry) {
                var json = JSON.stringify(network);
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
                    var json = JSON.stringify(network);
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
    network = JSON.parse(networkData);
    objectLayer.clearLayers();
    network.ztps.forEach(function (ztp) {
        Leaflet.marker([ztp.coordinates.x, ztp.coordinates.y], {
            icon: ztpIcon,
            id: ztp.id,
            type: AddingObject.ZTP
        }).on('click', onObjectClick)
            .addTo(objectLayer);
    });
    network.tpns.forEach(function (tpn) {
        Leaflet.marker([tpn.coordinates.x, tpn.coordinates.y], {
            icon: tpnIcon,
            id: tpn.id,
            type: AddingObject.TPN
        }).on('click', onObjectClick)
            .addTo(objectLayer);
    });
    network.pillars.forEach(function (pillar) {
        Leaflet.marker([pillar.coordinates.x, pillar.coordinates.y], {
            icon: pillarIcon,
            id: pillar.id,
            type: AddingObject.PILLAR
        }).on('click', onObjectClick)
            .addTo(objectLayer);
    });
    network.lines.forEach(function (line) {
        if (line instanceof AirLine) {
            Leaflet.polyline([
                [line.point1Coordinates.x, line.point1Coordinates.y],
                [line.point2Coordinates.x, line.point2Coordinates.y]
            ], {
                color: "green",
                weight: '2',
                dashArray: '5, 4',
                id: line.id
            }).on('click', onObjectClick).addTo(map);
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
            case AddingObject.TPN:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: tpnIcon,
                    id: ++network.maxId,
                    type: AddingObject.TPN
                }).on('click', onObjectClick);
                network.tpns.set(network.maxId, new Tpn(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng)));
                break;
            case AddingObject.ZTP:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: ztpIcon,
                    id: ++network.maxId,
                    type: AddingObject.ZTP
                }).on('click', onObjectClick);
                network.ztps.set(network.maxId, new Ztp(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng)));
                break;
            case AddingObject.PILLAR:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: pillarIcon,
                    id: ++network.maxId,
                    type: AddingObject.PILLAR
                }).on('click', onObjectClick);
                network.pillars.set(network.maxId, new Pillar(network.maxId, new PointCoordinates(e.latlng.lat, e.latlng.lng)));
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
                case AddingObject.TPN:
                    network.tpns.delete(this.options.id);
                    break;
                case AddingObject.ZTP:
                    network.ztps.delete(this.options.id);
                    break;
                case AddingObject.PILLAR:
                    network.pillars.delete(this.options.id);
                    break;
                case AddingObject.AIR_LINE:
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
                    type: AddingObject.AIR_LINE
                }).on('click', onObjectClick).addTo(map);
                network.lines.set(network.maxId, new AirLine(network.maxId, linePoint1, linePoint2));
                linePoint1 = undefined;
                linePoint2 = undefined;
            }
            break;
    }
}
//# sourceMappingURL=index.js.map