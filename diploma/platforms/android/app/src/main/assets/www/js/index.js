// defs
var Leaflet = window['L'];
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
    Network.prototype.inputDispatcherName = function (id, value) {
        var building = this.buildings.get(parseInt(id));
        building.dispatcherName = value;
    };
    Network.prototype.inputLat = function (id, value) {
        var building = this.buildings.get(parseInt(id));
        building.coordinates.x = Number(value);
        objectLayer.eachLayer(function (element) {
            if (element.options.id == building.id) {
                element.setLatLng([building.coordinates.x, building.coordinates.y]);
            }
        });
    };
    Network.prototype.inputLng = function (id, value) {
        var building = this.buildings.get(parseInt(id));
        building.coordinates.y = Number(value);
        objectLayer.eachLayer(function (element) {
            if (element.options.id == building.id) {
                element.setLatLng([building.coordinates.x, building.coordinates.y]);
            }
        });
    };
    return Network;
}());
var Building = /** @class */ (function () {
    function Building(id, coordinates, type, dispatcherName) {
        if (dispatcherName === void 0) { dispatcherName = ""; }
        this.id = id;
        this.coordinates = coordinates;
        this.type = type;
        this.dispatcherName = dispatcherName;
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
var InterfaceHandler = /** @class */ (function () {
    function InterfaceHandler() {
        this.editMode = false;
        this.journalIsOpen = false;
        this.addingObject = AddingObject.NONE;
    }
    InterfaceHandler.prototype.toggleMode = function () {
        if (this.editMode) {
            document.getElementById("switchModeButton").style.borderBottom = "none";
            this.setEditButtonsBorders("none");
            this.setEditButtonsDisplay("none");
            this.addingObject = AddingObject.NONE;
            document.getElementById("journalButton").style.display = "inline-block";
        }
        else {
            document.getElementById("switchModeButton").style.borderBottom = "5px solid #8de3e3";
            this.setEditButtonsDisplay("inline-block");
            document.getElementById("journalButton").style.display = "none";
            if (this.journalIsOpen)
                this.toggleJournal();
        }
        this.editMode = !this.editMode;
    };
    InterfaceHandler.prototype.toggleJournal = function () {
        if (this.journalIsOpen) {
            document.getElementById("journalButton").style.borderBottom = "none";
            document.getElementById("journal").style.display = "none";
            document.getElementById("map").style.visibility = "visible";
        }
        else {
            document.getElementById("journalButton").style.borderBottom = "5px solid #8de3e3";
            document.getElementById("journal").style.display = "block";
            document.getElementById("map").style.visibility = "hidden";
        }
        this.journalIsOpen = !this.journalIsOpen;
    };
    InterfaceHandler.prototype.addSubStation = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.SUB_STATION) {
            interfaceHandler.addingObject = AddingObject.SUB_STATION;
            document.getElementById("addSubStationButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addRp = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.RP) {
            interfaceHandler.addingObject = AddingObject.RP;
            document.getElementById("addRpButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addRecloser = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.RECLOSER) {
            interfaceHandler.addingObject = AddingObject.RECLOSER;
            document.getElementById("addRecloserButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addDelimiter = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.DELIMITER) {
            interfaceHandler.addingObject = AddingObject.DELIMITER;
            document.getElementById("addDelimiterButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addTpn = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.TPN) {
            interfaceHandler.addingObject = AddingObject.TPN;
            document.getElementById("addTpnButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addZtp = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.ZTP) {
            interfaceHandler.addingObject = AddingObject.ZTP;
            document.getElementById("addZtpButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addPillar = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.PILLAR) {
            interfaceHandler.addingObject = AddingObject.PILLAR;
            document.getElementById("addPillarButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addAirLine = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.AIR_LINE) {
            interfaceHandler.addingObject = AddingObject.AIR_LINE;
            document.getElementById("addAirLineButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.addCableLine = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.CABLE_LINE) {
            interfaceHandler.addingObject = AddingObject.CABLE_LINE;
            document.getElementById("addCableLineButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.deleteObject = function () {
        this.setEditButtonsBorders("none");
        if (interfaceHandler.addingObject != AddingObject.DELETE) {
            interfaceHandler.addingObject = AddingObject.DELETE;
            document.getElementById("binButton").style.borderBottom = "5px solid #8de3e3";
        }
        else {
            interfaceHandler.addingObject = AddingObject.NONE;
        }
    };
    InterfaceHandler.prototype.setEditButtonsBorders = function (borderStyle) {
        Array
            .from(document.getElementsByClassName("editButton"))
            .forEach(function (element) {
            element.style.borderBottom = borderStyle;
        });
    };
    InterfaceHandler.prototype.setEditButtonsDisplay = function (display) {
        Array
            .from(document.getElementsByClassName("editButton"))
            .forEach(function (element) {
            element.style.display = display;
        });
    };
    InterfaceHandler.prototype.toggleBuildingProperties = function (open, building) {
        if (!open) {
            document.getElementById("properties").style.visibility = "hidden";
        }
        else {
            document.getElementById("properties").style.visibility = "visible";
            var nameInputElement = document.getElementById("dispatcherName");
            nameInputElement.setAttribute('name', building.id.toString());
            nameInputElement.setAttribute('value', building.dispatcherName);
            if (this.editMode) {
                nameInputElement.removeAttribute('readonly');
            }
            else {
                nameInputElement.setAttribute('readonly', 'readonly');
            }
            var latInput = document.getElementById("lat");
            var lngInput = document.getElementById("lng");
            latInput.setAttribute('name', building.id.toString());
            latInput.setAttribute('value', building.coordinates.x.toString());
            if (this.editMode) {
                latInput.removeAttribute('readonly');
            }
            else {
                latInput.setAttribute('readonly', 'readonly');
            }
            lngInput.setAttribute('name', building.id.toString());
            lngInput.setAttribute('value', building.coordinates.y.toString());
            if (this.editMode) {
                lngInput.removeAttribute('readonly');
            }
            else {
                lngInput.setAttribute('readonly', 'readonly');
            }
        }
    };
    return InterfaceHandler;
}());
var FileSystemHandler = /** @class */ (function () {
    function FileSystemHandler() {
        this.PATH = "file:///storage/emulated/0";
    }
    FileSystemHandler.prototype.onDeviceReady = function () {
        fileSystemHandler.chooser = window['chooser'];
        fileSystemHandler.resolveLocalFileSystemURL = window['resolveLocalFileSystemURL'];
        fileSystemHandler.resolveLocalFileSystemURL(fileSystemHandler.PATH, function (dir) {
            dir.getDirectory("Krymenergo", { create: true }, function (dir) { });
        });
        fileSystemHandler.PATH = "file:///storage/emulated/0/Krymenergo";
        fileSystemHandler.resolveLocalFileSystemURL(fileSystemHandler.PATH, function (dir) {
            dir.getFile("journal.txt", { create: true }, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onerror = function (e) {
                        alert("Не удалось прочитать файл журнала. Проверьте корректность выбора директории и имени файла");
                    };
                    reader.onloadend = function (e) {
                        // @ts-ignore
                        document.getElementById("journalTextArea").value = this.result.toString();
                    };
                    reader.readAsText(file);
                });
            });
        });
        fileSystemHandler.recognition = window['plugins'].speechRecognition;
        fileSystemHandler.recognition.isRecognitionAvailable(function (available) {
            if (!available)
                alert("Распознавание речи недоступно. Проверьте подключение к Интернету");
            fileSystemHandler.recognition.hasPermission(function (isGranted) {
                if (!isGranted) {
                    // Request the permission
                    fileSystemHandler.recognition.requestPermission(function () { }, function (err) {
                        alert(err);
                    });
                }
            }, function (err) {
                alert(err);
            });
        }, function (err) {
            alert(err);
        });
    };
    FileSystemHandler.prototype.saveFile = function (createNew) {
        var _this = this;
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
            this.resolveLocalFileSystemURL(this.PATH, function (dir) {
                dir.getFile(fileName_1, { create: true }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onerror = function (e) {
                            alert("Не удалось записать файл сети. Проверьте корректность выбора директории и имени файла");
                        };
                        var dataObj = new Blob([json], { type: 'text/plain' });
                        fileWriter.write(dataObj);
                    });
                });
            });
        }
        else {
            this.chooser
                .getFile()
                .then(function (file) {
                _this.resolveLocalFileSystemURL(_this.PATH, function (dir) {
                    dir.getFile(file.name, { create: true }, function (fileEntry) {
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onerror = function (e) {
                                alert("Не удалось записать файл сети. Проверьте корректность выбора директории и имени файла");
                            };
                            var dataObj = new Blob([json], { type: 'text/plain' });
                            fileWriter.write(dataObj);
                        });
                    });
                });
            });
        }
    };
    FileSystemHandler.prototype.readNetworkFromFile = function () {
        var _this = this;
        this.chooser
            .getFile()
            .then(function (file) {
            _this.resolveLocalFileSystemURL(_this.PATH, function (dir) {
                dir.getFile(file.name, { create: true }, function (fileEntry) {
                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onerror = function (e) {
                            alert("Не удалось прочитать файл сети. Проверьте корректность выбора директории и имени файла");
                        };
                        reader.onloadend = function (e) {
                            fileSystemHandler.loadNetwork(this.result.toString());
                        };
                        reader.readAsText(file);
                    });
                });
            });
        });
    };
    FileSystemHandler.prototype.loadNetwork = function (networkData) {
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
            var marker;
            switch (building.type) {
                case Building.Type.RP:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: RP_ICON,
                        id: building.id,
                        type: Building.Type.RP
                    });
                    break;
                case Building.Type.SUB_STATION:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: SUB_STATION_ICON,
                        id: building.id,
                        type: Building.Type.SUB_STATION
                    });
                    break;
                case Building.Type.RECLOSER:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: RECLOSER_ICON,
                        id: building.id,
                        type: Building.Type.RECLOSER
                    });
                    break;
                case Building.Type.DELIMITER:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: DELIMITER_ICON,
                        id: building.id,
                        type: Building.Type.DELIMITER
                    });
                    break;
                case Building.Type.TPN:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: TPN_ICON,
                        id: building.id,
                        type: Building.Type.TPN
                    });
                    break;
                case Building.Type.ZTP:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: ZTP_ICON,
                        id: building.id,
                        type: AddingObject.ZTP
                    });
                    break;
                case Building.Type.PILLAR:
                    marker = Leaflet.marker([building.coordinates.x, building.coordinates.y], {
                        icon: PILLAR_ICON,
                        id: building.id,
                        type: AddingObject.PILLAR
                    });
                    break;
            }
            marker.on('click', onObjectClick).addTo(objectLayer);
        });
        network.lines.forEach(function (line, id) {
            var polyline;
            switch (polyline.type) {
                case Line.Type.AIR:
                    polyline = Leaflet.polyline([
                        [line.point1Coordinates.x, line.point1Coordinates.y],
                        [line.point2Coordinates.x, line.point2Coordinates.y]
                    ], {
                        color: "green",
                        weight: '2',
                        dashArray: '5, 4',
                        id: line.id,
                        type: Line.Type.AIR
                    });
                    break;
                case Line.Type.CABLE:
                    polyline = Leaflet.polyline([
                        [line.point1Coordinates.x, line.point1Coordinates.y],
                        [line.point2Coordinates.x, line.point2Coordinates.y]
                    ], {
                        color: "green",
                        weight: '2',
                        id: line.id,
                        type: Line.Type.CABLE
                    });
                    break;
            }
            polyline.on('click', onObjectClick).addTo(objectLayer);
        });
    };
    FileSystemHandler.prototype.record = function () {
        document.getElementById("recordButton").style.border = "1px solid red";
        fileSystemHandler.recognition.startListening(fileSystemHandler.onresult, function (err) {
            alert(err);
        }, {
            language: "ru-RU",
            showPopup: false
        });
    };
    FileSystemHandler.prototype.onresult = function (result) {
        var date = new Date();
        var dateTimeString = date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        var speechRecognitionString = "" + result[0].charAt(0).toUpperCase() + result[0].slice(1) + ".";
        var output = dateTimeString + "\n" + speechRecognitionString + "\n\n";
        // @ts-ignore
        document.getElementById("journalTextArea").value += output;
        fileSystemHandler.onJournalInput();
        document.getElementById("recordButton").style.border = "none";
    };
    FileSystemHandler.prototype.onJournalInput = function () {
        fileSystemHandler.resolveLocalFileSystemURL(fileSystemHandler.PATH, function (dir) {
            dir.getFile("journal.txt", { create: true }, function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onerror = function (e) {
                        alert("Не удалось записать файл журнала. Повторите попытку ввода");
                    };
                    // @ts-ignore
                    var info = document.getElementById('journalTextArea').value;
                    var dataObj = new Blob([info], { type: 'text/plain;charset=UTF-8' });
                    fileWriter.write(dataObj);
                });
            });
        });
    };
    return FileSystemHandler;
}());
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
// end defs
var map = Leaflet.map('map').setView([55.75, 37.62], 15);
var objectLayer = Leaflet.layerGroup().addTo(map);
var interfaceHandler = new InterfaceHandler();
var network = new Network();
var fileSystemHandler = new FileSystemHandler();
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
document.addEventListener("deviceready", fileSystemHandler.onDeviceReady, false);
// def methods
map.on('click', onMapClick);
map.on('locationfound', onLocationFound);
map.locate({ watch: true, setView: false });
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    locationMarker.setLatLng(e.latlng).update();
    circle.setLatLng(e.latlng).setRadius(radius);
}
function onMapClick(e) {
    if (interfaceHandler.editMode) {
        var buildingMarker;
        switch (interfaceHandler.addingObject) {
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
            case AddingObject.NONE:
                interfaceHandler.toggleBuildingProperties(false);
            default: break;
        }
        if (buildingMarker) {
            buildingMarker.addTo(objectLayer);
        }
    }
    else {
        if (interfaceHandler.addingObject == AddingObject.NONE)
            interfaceHandler.toggleBuildingProperties(false);
    }
}
function onObjectClick() {
    if (interfaceHandler.editMode) {
        switch (interfaceHandler.addingObject) {
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
                if (!interfaceHandler.linePoint1) { // point 1 is undefined
                    interfaceHandler.linePoint1 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
                }
                else {
                    interfaceHandler.linePoint2 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
                    Leaflet.polyline([
                        [interfaceHandler.linePoint1.x, interfaceHandler.linePoint1.y],
                        [interfaceHandler.linePoint2.x, interfaceHandler.linePoint2.y]
                    ], {
                        color: "green",
                        weight: '2',
                        dashArray: '5, 4',
                        id: ++network.maxId,
                        type: Line.Type.AIR
                    }).on('click', onObjectClick).addTo(map);
                    network.lines.set(network.maxId, new Line(network.maxId, interfaceHandler.linePoint1, interfaceHandler.linePoint2, Line.Type.AIR));
                    interfaceHandler.linePoint1 = undefined;
                    interfaceHandler.linePoint2 = undefined;
                }
                break;
            case AddingObject.CABLE_LINE:
                if (!interfaceHandler.linePoint1) { // point 1 is undefined
                    interfaceHandler.linePoint1 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
                }
                else {
                    interfaceHandler.linePoint2 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng);
                    Leaflet.polyline([
                        [interfaceHandler.linePoint1.x, interfaceHandler.linePoint1.y],
                        [interfaceHandler.linePoint2.x, interfaceHandler.linePoint2.y]
                    ], {
                        color: "green",
                        weight: '2',
                        id: ++network.maxId,
                        type: Line.Type.CABLE
                    }).on('click', onObjectClick).addTo(map);
                    network.lines.set(network.maxId, new Line(network.maxId, interfaceHandler.linePoint1, interfaceHandler.linePoint2, Line.Type.AIR));
                    interfaceHandler.linePoint1 = undefined;
                    interfaceHandler.linePoint2 = undefined;
                }
                break;
            case AddingObject.NONE:
                var building = network.buildings.get(this.options.id);
                interfaceHandler.toggleBuildingProperties(true, building);
                break;
        }
    }
    else {
        var building = network.buildings.get(this.options.id);
        interfaceHandler.toggleBuildingProperties(true, building);
    }
}
//# sourceMappingURL=index.js.map