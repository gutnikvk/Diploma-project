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
    function Network(id, subStations, rps, reclosers, delimiters, ztps, tpns, pillars) {
        if (subStations === void 0) { subStations = new Array(); }
        if (rps === void 0) { rps = new Array(); }
        if (reclosers === void 0) { reclosers = new Array(); }
        if (delimiters === void 0) { delimiters = new Array(); }
        if (ztps === void 0) { ztps = new Array(); }
        if (tpns === void 0) { tpns = new Array(); }
        if (pillars === void 0) { pillars = new Array(); }
        this.id = id;
        this.subStations = subStations;
        this.rps = rps;
        this.reclosers = reclosers;
        this.delimiters = delimiters;
        this.ztps = ztps;
        this.tpns = tpns;
        this.pillars = pillars;
    }
    return Network;
}());
var Building = /** @class */ (function () {
    function Building(coordinates) {
        this.coordinates = coordinates;
    }
    return Building;
}());
var SubStation = /** @class */ (function (_super) {
    __extends(SubStation, _super);
    function SubStation(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return SubStation;
}(Building));
var Ztp = /** @class */ (function (_super) {
    __extends(Ztp, _super);
    function Ztp(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return Ztp;
}(Building));
var Pillar = /** @class */ (function (_super) {
    __extends(Pillar, _super);
    function Pillar(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return Pillar;
}(Building));
var Recloser = /** @class */ (function (_super) {
    __extends(Recloser, _super);
    function Recloser(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return Recloser;
}(Building));
var Delimiter = /** @class */ (function (_super) {
    __extends(Delimiter, _super);
    function Delimiter(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return Delimiter;
}(Building));
var Tpn = /** @class */ (function (_super) {
    __extends(Tpn, _super);
    function Tpn(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return Tpn;
}(Building));
var Rp = /** @class */ (function (_super) {
    __extends(Rp, _super);
    function Rp(coordinates) {
        return _super.call(this, coordinates) || this;
    }
    return Rp;
}(Building));
var Leaflet = window['L'];
var editMode = false;
var AddingBuilding;
(function (AddingBuilding) {
    AddingBuilding[AddingBuilding["ZTP"] = 0] = "ZTP";
    AddingBuilding[AddingBuilding["RP"] = 1] = "RP";
    AddingBuilding[AddingBuilding["SUB_STATION"] = 2] = "SUB_STATION";
    AddingBuilding[AddingBuilding["TPN"] = 3] = "TPN";
    AddingBuilding[AddingBuilding["RECLOSER"] = 4] = "RECLOSER";
    AddingBuilding[AddingBuilding["DELIMITER"] = 5] = "DELIMITER";
    AddingBuilding[AddingBuilding["NONE"] = 6] = "NONE";
    AddingBuilding[AddingBuilding["DELETE"] = 7] = "DELETE";
})(AddingBuilding || (AddingBuilding = {}));
var addingBuilding = AddingBuilding.NONE;
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
        var buildingMarker = Leaflet.marker([ztp.coordinates.x, ztp.coordinates.y], {
            icon: ztpIcon
        }).on('click', onObjectClick);
        buildingMarker.addTo(objectLayer);
    });
    network.tpns.forEach(function (tpn) {
        var buildingMarker = Leaflet.marker([tpn.coordinates.x, tpn.coordinates.y], {
            icon: tpnIcon
        }).on('click', onObjectClick);
        buildingMarker.addTo(objectLayer);
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
        addingBuilding = AddingBuilding.NONE;
    }
    else {
        document.getElementById("switchModeButton").style.borderBottom = "5px solid #8de3e3";
        setEditButtonsDisplay("inline-block");
    }
    editMode = !editMode;
}
function addTpn() {
    setEditButtonsBorders("none");
    if (addingBuilding != AddingBuilding.TPN) {
        addingBuilding = AddingBuilding.TPN;
        document.getElementById("addTpnButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingBuilding = AddingBuilding.NONE;
    }
}
function addZtp() {
    setEditButtonsBorders("none");
    if (addingBuilding != AddingBuilding.ZTP) {
        addingBuilding = AddingBuilding.ZTP;
        document.getElementById("addZtpButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingBuilding = AddingBuilding.NONE;
    }
}
function deleteObject() {
    setEditButtonsBorders("none");
    if (addingBuilding != AddingBuilding.DELETE) {
        addingBuilding = AddingBuilding.DELETE;
        document.getElementById("binButton").style.borderBottom = "5px solid #8de3e3";
    }
    else {
        addingBuilding = AddingBuilding.NONE;
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
        switch (addingBuilding) {
            case AddingBuilding.TPN:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: tpnIcon
                }).on('click', onObjectClick);
                network.tpns.push(new Tpn(new PointCoordinates(e.latlng.lat, e.latlng.lng)));
                break;
            case AddingBuilding.ZTP:
                buildingMarker = Leaflet.marker(e.latlng, {
                    icon: ztpIcon
                }).on('click', onObjectClick);
                network.ztps.push(new Ztp(new PointCoordinates(e.latlng.lat, e.latlng.lng)));
                break;
            case AddingBuilding.DELETE:
                break;
        }
        if (addingBuilding != AddingBuilding.NONE
            && addingBuilding != AddingBuilding.DELETE) {
            buildingMarker.addTo(objectLayer);
        }
    }
}
function onObjectClick() {
    if (addingBuilding == AddingBuilding.DELETE) {
        map.removeLayer(this);
    }
}
//# sourceMappingURL=index.js.map