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
    buildings: Map<number, Building>
    lines: Map<number, Line>
    maxId: number
    constructor(
        buildings: Map<number, Building> = new Map(),
        lines: Map<number, Line> = new Map(),
        maxId: number = 0
    ) {
        this.buildings = buildings
        this.lines = lines
        this.maxId = maxId
    }
}
class Building {
    id: number
    coordinates: PointCoordinates
    type: Building.Type
    dispatcherName: string
    constructor(id: number, coordinates: PointCoordinates, type: Building.Type, dispatcherName: string = "") {
        this.id = id
        this.coordinates = coordinates
        this.type = type
        this.dispatcherName = dispatcherName
    }
}
namespace Building {
    export enum Type {
        SUB_STATION,
        ZTP,
        RP,
        PILLAR,
        RECLOSER,
        DELIMITER,
        TPN
    }
}
class Line {
    id: number
    point1Coordinates: PointCoordinates
    point2Coordinates: PointCoordinates
    type: Line.Type
    constructor(id: number, point1Coordinates: PointCoordinates, point2Coordinates: PointCoordinates, type: Line.Type) {
        this.id = id
        this.point1Coordinates = point1Coordinates
        this.point2Coordinates = point2Coordinates
        this.type = type
    }
}
namespace Line {
    export enum Type {
        AIR,
        CABLE
    }
}
enum AddingObject {
    ZTP,
    RP,
    SUB_STATION,
    TPN,
    RECLOSER,
    DELIMITER,
    PILLAR,
    AIR_LINE,
    CABLE_LINE,
    NONE,
    DELETE
}
class Journal {
    userName: string
    startDateTime: Date
    records: Array<Journal.Record>
    constructor(userName: string) {
        this.userName = userName
        this.startDateTime = new Date()
        this.records = new Array()
    }
}
namespace Journal {
    export class Record{
        dateTime: Date
        content: string
    }
}
// end defs

const Leaflet = window['L']
var editMode = false
var journalIsOpen = false

var addingObject: AddingObject = AddingObject.NONE
var linePoint1: PointCoordinates
var linePoint2: PointCoordinates
const map = Leaflet.map('map').setView([55.75, 37.62], 15);
const objectLayer = Leaflet.layerGroup().addTo(map)
const SUB_STATION_ICON = Leaflet.icon(
    {
        iconUrl: './img/subStationIcon.svg',
        iconAnchor: [15, 15]
    }
)
const RP_ICON = Leaflet.icon(
    {
        iconUrl: './img/rpIcon.svg',
        iconAnchor: [15, 15]
    }
)
const RECLOSER_ICON = Leaflet.icon(
    {
        iconUrl: './img/recloserIcon.svg',
        iconAnchor: [10, 10]
    }
)
const DELIMITER_ICON = Leaflet.icon(
    {
        iconUrl: './img/delimiterIcon.svg',
        iconAnchor: [10, 10]
    }
)
const TPN_ICON = Leaflet.icon(
    {
        iconUrl: './img/tpnIcon.svg',
        iconAnchor: [10, 10]
    }
)
const ZTP_ICON = Leaflet.icon(
    {
        iconUrl: './img/ztpIcon.svg',
        iconAnchor: [10, 10]
    }
)
const PILLAR_ICON = Leaflet.icon(
    {
        iconUrl: './img/pillarIcon.svg',
        iconAnchor: [4, 4]
    }
)
var network = new Network()

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
var PATH = "file:///storage/emulated/0"
var resolveLocalFileSystemURL
var chooser
var recognition

function onDeviceReady() {
    chooser = window['chooser']
    resolveLocalFileSystemURL = window['resolveLocalFileSystemURL']
    resolveLocalFileSystemURL(PATH, function(dir) {
        dir.getDirectory("Krymenergo", {create:true}, function(dir) {})
    })
    PATH = "file:///storage/emulated/0/Krymenergo"
    resolveLocalFileSystemURL(PATH, function(dir) {
        dir.getFile("journal.txt", {create:true}, function(fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader()
                reader.onerror = function(e) {
                    alert("Не удалось прочитать файл журнала. Проверьте корректность выбора директории и имени файла")
                }
                reader.onloadend = function(e) {
                    // @ts-ignore
                    document.getElementById("journalTextArea").value = this.result.toString()
                }
                reader.readAsText(file)
            })
        })
    })
    recognition = window['plugins'].speechRecognition
    recognition.isRecognitionAvailable(
        function(available){
            if (!available) alert("Распознавание речи недоступно. Проверьте подключение к Интернету")
            recognition.hasPermission(
                function (isGranted: boolean) {
                    if (!isGranted) {
                        // Request the permission
                        recognition.requestPermission(
                            () => {},
                            function (err){
                                alert(err)
                            }
                        )
                    }
                },
                function(err){
                    alert(err)
                }
            )
        }, 
        function(err){
            alert(err)
        }
    )
}

// def methods
map.on('click', onMapClick)
map.on('locationfound', onLocationFound)
map.locate({watch: true, setView: false})

function record(){
    document.getElementById("recordButton").style.border = "1px solid red"
    recognition.startListening(
        onresult,
        function(err) {
            alert(err)
        }, 
        {
            language: "ru-RU",
            showPopup: false
        }
    )
}

function onresult(result: string) {
    let date = new Date()
    let dateTimeString = `${date.getDate()}.${(date.getMonth()+1)}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    let speechRecognitionString = `${result[0].charAt(0).toUpperCase()}${result[0].slice(1)}.`
    let output = `${dateTimeString}\n${speechRecognitionString}\n\n`
    // @ts-ignore
    document.getElementById("journalTextArea").value += output
    onJournalInput()
    document.getElementById("recordButton").style.border = "none"
}

function saveFile(createNew: boolean) {
    let json = JSON.stringify(
        network,
        (key, value) => {
            if (value instanceof Map) {
                return {
                    dataType: 'Map', 
                    value: Array.from(value.entries())
                }
            } else {
                return value
            }
        }
    )
    if (createNew) {
        let fileName = prompt("Введите имя файла для сохранения") + ".json"
        resolveLocalFileSystemURL(PATH, function(dir) {
            dir.getFile(fileName, {create:true}, function(fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onerror = function (e) {
                        alert("Не удалось записать файл сети. Проверьте корректность выбора директории и имени файла")
                    }
                    const dataObj = new Blob([json], { type: 'text/plain' })
            
                    fileWriter.write(dataObj)
                })
            })
        })
    } else {
        chooser
            .getFile()
            .then(
                file => {
                    resolveLocalFileSystemURL(PATH, function(dir) {
                        dir.getFile(file.name, {create:true}, function(fileEntry) {
                            fileEntry.createWriter(function (fileWriter) {
                                fileWriter.onerror = function (e) {
                                    alert("Не удалось записать файл сети. Проверьте корректность выбора директории и имени файла")
                                }
                                const dataObj = new Blob([json], { type: 'text/plain' })
                        
                                fileWriter.write(dataObj)
                            })
                        })
                    })
                }
            )
    }
}

function readNetworkFromFile() {
    chooser
        .getFile()
        .then(
            file => {
                resolveLocalFileSystemURL(PATH, function(dir) {
                    dir.getFile(file.name, {create:true}, function(fileEntry) {
                        fileEntry.file(function (file) {
                            var reader = new FileReader()
                            reader.onerror = function(e) {
                                alert("Не удалось прочитать файл сети. Проверьте корректность выбора директории и имени файла")
                            }
                            reader.onloadend = function(e) {
                                loadNetwork(this.result.toString())
                            }
                            reader.readAsText(file)
                        })
                    })
                })
            }
        )
}

function loadNetwork(networkData: string) {
    network = JSON.parse(
        networkData,
        (key, value) => {
            if (value.dataType === 'Map') {
                return new Map(value.value)
            } else {
                return value
            }
        }
    )
    objectLayer.clearLayers()
    network.buildings.forEach(
        (building, id) => {
            var marker
            switch (building.type) {
                case Building.Type.RP:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: RP_ICON,
                            id: building.id,
                            type: Building.Type.RP
                        }
                    )
                    break
                case Building.Type.SUB_STATION:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: SUB_STATION_ICON,
                            id: building.id,
                            type: Building.Type.SUB_STATION
                        }
                    )
                    break
                case Building.Type.RECLOSER:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: RECLOSER_ICON,
                            id: building.id,
                            type: Building.Type.RECLOSER
                        }
                    )
                    break
                case Building.Type.DELIMITER:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: DELIMITER_ICON,
                            id: building.id,
                            type: Building.Type.DELIMITER
                        }
                    )
                    break
                case Building.Type.TPN:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: TPN_ICON,
                            id: building.id,
                            type: Building.Type.TPN
                        }
                    )
                    break
                case Building.Type.ZTP:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: ZTP_ICON,
                            id: building.id,
                            type: AddingObject.ZTP
                        }
                    )
                    break
                case Building.Type.PILLAR:
                    marker = Leaflet.marker(
                        [building.coordinates.x, building.coordinates.y],
                        {
                            icon: PILLAR_ICON,
                            id: building.id,
                            type: AddingObject.PILLAR
                        }
                    )
                    break
            }
            marker.on('click', onObjectClick).addTo(objectLayer)
        }
    )
    network.lines.forEach(
        (line, id) => {
            var polyline
            switch (polyline.type) {
                case Line.Type.AIR:
                    polyline = Leaflet.polyline(
                        [
                            [line.point1Coordinates.x, line.point1Coordinates.y],
                            [line.point2Coordinates.x, line.point2Coordinates.y]
                        ],
                        {
                            color: "green",
                            weight: '2',
                            dashArray: '5, 4',
                            id: line.id,
                            type: Line.Type.AIR
                        }
                    )
                    break
                case Line.Type.CABLE:
                    polyline = Leaflet.polyline(
                        [
                            [line.point1Coordinates.x, line.point1Coordinates.y],
                            [line.point2Coordinates.x, line.point2Coordinates.y]
                        ],
                        {
                            color: "green",
                            weight: '2',
                            id: line.id,
                            type: Line.Type.CABLE
                        }
                    )
                    break
            }
            polyline.on('click', onObjectClick).addTo(objectLayer)
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
        addingObject = AddingObject.NONE
        document.getElementById("journalButton").style.display = "inline-block"
    } else {
        document.getElementById("switchModeButton").style.borderBottom = "5px solid #8de3e3"
        setEditButtonsDisplay("inline-block")
        document.getElementById("journalButton").style.display = "none"
        if (journalIsOpen) toggleJournal()
    }
    editMode = !editMode
}

function toggleJournal() {
    if (journalIsOpen) {
        document.getElementById("journalButton").style.borderBottom = "none"
        document.getElementById("journal").style.display = "none"
        document.getElementById("map").style.visibility = "visible"
    } else {
        document.getElementById("journalButton").style.borderBottom = "5px solid #8de3e3"
        document.getElementById("journal").style.display = "block"
        document.getElementById("map").style.visibility = "hidden"
    }
    journalIsOpen = !journalIsOpen
}

function onJournalInput() {
    resolveLocalFileSystemURL(PATH, function(dir) {
        dir.getFile("journal.txt", {create:true}, function(fileEntry) {
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onerror = function (e) {
                    alert("Не удалось записать файл журнала. Повторите попытку ввода")
                }
                // @ts-ignore
                let info = document.getElementById('journalTextArea').value
                const dataObj = new Blob([info], { type: 'text/plain;charset=UTF-8' })
        
                fileWriter.write(dataObj)
            })
        })
    })
}

function addSubStation() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.SUB_STATION) {
        addingObject = AddingObject.SUB_STATION
        document.getElementById("addSubStationButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addRp() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.RP) {
        addingObject = AddingObject.RP
        document.getElementById("addRpButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addRecloser() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.RECLOSER) {
        addingObject = AddingObject.RECLOSER
        document.getElementById("addRecloserButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addDelimiter() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.DELIMITER) {
        addingObject = AddingObject.DELIMITER
        document.getElementById("addDelimiterButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addTpn() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.TPN) {
        addingObject = AddingObject.TPN
        document.getElementById("addTpnButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addZtp() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.ZTP) {
        addingObject = AddingObject.ZTP
        document.getElementById("addZtpButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addPillar() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.PILLAR) {
        addingObject = AddingObject.PILLAR
        document.getElementById("addPillarButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addAirLine() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.AIR_LINE) {
        addingObject = AddingObject.AIR_LINE
        document.getElementById("addAirLineButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function addCableLine() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.CABLE_LINE) {
        addingObject = AddingObject.CABLE_LINE
        document.getElementById("addCableLineButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
    }
}

function deleteObject() {
    setEditButtonsBorders("none")
    if (addingObject != AddingObject.DELETE) {
        addingObject = AddingObject.DELETE
        document.getElementById("binButton").style.borderBottom = "5px solid #8de3e3"
    } else {
        addingObject = AddingObject.NONE
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
        switch (addingObject) {
            case AddingObject.SUB_STATION:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: SUB_STATION_ICON,
                        id: ++network.maxId,
                        type: Building.Type.SUB_STATION
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.SUB_STATION
                    )
                )
                break
            case AddingObject.RP:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: RP_ICON,
                        id: ++network.maxId,
                        type: Building.Type.RP
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.RP
                    )
                )
                break
            case AddingObject.RECLOSER:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: RECLOSER_ICON,
                        id: ++network.maxId,
                        type: Building.Type.RECLOSER
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.RECLOSER
                    )
                )
                break
            case AddingObject.DELIMITER:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: DELIMITER_ICON,
                        id: ++network.maxId,
                        type: Building.Type.DELIMITER
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.DELIMITER
                    )
                )
                break
            case AddingObject.TPN:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: TPN_ICON,
                        id: ++network.maxId,
                        type: Building.Type.TPN
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.TPN
                    )
                )
                break
            case AddingObject.ZTP:
                buildingMarker = Leaflet.marker(
                    e.latlng,
                    {
                        icon: ZTP_ICON,
                        id: ++network.maxId,
                        type: Building.Type.ZTP
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.ZTP
                    )
                )
                break
            case AddingObject.PILLAR:
                buildingMarker = Leaflet.marker(
                    e.latlng, 
                    {
                        icon: PILLAR_ICON,
                        id: ++network.maxId,
                        type: Building.Type.PILLAR
                    }
                ).on('click', onObjectClick)
                network.buildings.set(
                    network.maxId, 
                    new Building(
                        network.maxId,
                        new PointCoordinates(e.latlng.lat, e.latlng.lng),
                        Building.Type.PILLAR
                    )
                )
                break
            case AddingObject.NONE:
                toggleBuildingProperties(false)
            default: break
        }
        if (buildingMarker) {
                buildingMarker.addTo(objectLayer)
            }
    }
}

function onObjectClick() {
    if (editMode) {
        switch (addingObject) {
            case AddingObject.DELETE:
                map.removeLayer(this)
                switch (this.options.type) {
                    case Building.Type.TPN:
                    case Building.Type.ZTP:
                    case Building.Type.PILLAR:
                    case Building.Type.SUB_STATION:
                    case Building.Type.RP:
                    case Building.Type.DELIMITER:
                    case Building.Type.RECLOSER:
                        network.buildings.delete(this.options.id)
                        break
                    case Line.Type.AIR:
                    case Line.Type.CABLE:
                        network.lines.delete(this.options.id)
                        break
                }
                break
            case AddingObject.AIR_LINE:
                if (!linePoint1) { // point 1 is undefined
                    linePoint1 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng)
                } else {
                    linePoint2 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng)
                    Leaflet.polyline(
                        [
                            [linePoint1.x, linePoint1.y],
                            [linePoint2.x, linePoint2.y]
                        ],
                        {
                            color: "green",
                            weight: '2',
                            dashArray: '5, 4',
                            id: ++network.maxId,
                            type: Line.Type.AIR
                        }
                    ).on('click', onObjectClick).addTo(map)
                    network.lines.set(
                        network.maxId, 
                        new Line(
                            network.maxId,
                            linePoint1,
                            linePoint2,
                            Line.Type.AIR
                        )
                    )
                    linePoint1 = undefined
                    linePoint2 = undefined
                }
                break
            case AddingObject.CABLE_LINE:
                if (!linePoint1) { // point 1 is undefined
                    linePoint1 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng)
                } else {
                    linePoint2 = new PointCoordinates(this.getLatLng().lat, this.getLatLng().lng)
                    Leaflet.polyline(
                        [
                            [linePoint1.x, linePoint1.y],
                            [linePoint2.x, linePoint2.y]
                        ],
                        {
                            color: "green",
                            weight: '2',
                            id: ++network.maxId,
                            type: Line.Type.CABLE
                        }
                    ).on('click', onObjectClick).addTo(map)
                    network.lines.set(
                        network.maxId, 
                        new Line(
                            network.maxId,
                            linePoint1,
                            linePoint2,
                            Line.Type.AIR
                        )
                    )
                    linePoint1 = undefined
                    linePoint2 = undefined
                }
                break
            case AddingObject.NONE:
                let building = network.buildings.get(this.options.id)
                toggleBuildingProperties(true, building)
                break
        }
    } else {
        let building = network.buildings.get(this.options.id)
        toggleBuildingProperties(true, building)
    }
}

function toggleBuildingProperties(open: boolean, building?: Building) {
    if (!open) {
        document.getElementById("properties").style.visibility = "hidden"
    } else {
        document.getElementById("properties").style.visibility = "visible"
        var nameInputElement = document.getElementById("dispatcherName")
        nameInputElement.setAttribute('name', building.id.toString())
        nameInputElement.setAttribute('value', building.dispatcherName)
        if (editMode) {
            nameInputElement.removeAttribute('readonly')
        } else {
            nameInputElement.setAttribute('readonly', 'readonly')
        }
        var latInput = document.getElementById("lat")
        var lngInput = document.getElementById("lng")
        latInput.setAttribute('name', building.id.toString())
        latInput.setAttribute('value', building.coordinates.x.toString())
        if (editMode) {
            latInput.removeAttribute('readonly')
        } else {
            latInput.setAttribute('readonly', 'readonly')
        }
        lngInput.setAttribute('name', building.id.toString())
        lngInput.setAttribute('value', building.coordinates.y.toString())
        if (editMode) {
            lngInput.removeAttribute('readonly')
        } else {
            lngInput.setAttribute('readonly', 'readonly')
        }
    }
}

function inputDispatcherName(id: string, value: string) {
    var building = network.buildings.get(parseInt(id))
    building.dispatcherName = value
}

function inputLat(id: string, value: string) {
    var building = network.buildings.get(parseInt(id))
    building.coordinates.x = Number(value)
    objectLayer.eachLayer(
        element => {
            if (element.options.id == building.id) {
                element.setLatLng([building.coordinates.x, building.coordinates.y])
            }
        }
    )
}

function inputLng(id: string, value: string) {
    var building = network.buildings.get(parseInt(id))
    building.coordinates.y = Number(value)
    objectLayer.eachLayer(
        element => {
            if (element.options.id == building.id) {
                element.setLatLng([building.coordinates.x, building.coordinates.y])
            }
        }
    )
}