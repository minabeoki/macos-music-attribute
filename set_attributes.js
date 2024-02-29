function run() {
    const filename = 'iTunes Music Library.xml';

    var trackList = readXML(filename);

    console.log('Number of Tracks :', trackList.length)
    for (var i = 0; i < trackList.length; i++) {
        var track = trackList[i];
        console.log(track['Name']);
    }
}

function readXML(filename) {
    var app = Application.currentApplication()
    app.includeStandardAdditions = true
    var xmldata = $.NSString.stringWithContentsOfFileEncodingError(
        $(filename).stringByStandardizingPath,
        $.NSUTF8StringEncoding,
        $()
    ).js

    var xmlDoc = $.NSXMLDocument.alloc.initWithXMLStringOptionsError(xmldata, 0, null)
    var xmlRoot = xmlDoc.rootElement
    var xmlBody = ObjC.unwrap(xmlRoot.children)[0]
    var xmlList =  ObjC.unwrap(xmlBody.children)

    var trackList = []
    for (var i = 0; i < xmlList.length; i++) {
        var xmlNode = xmlList[i]
        var name = ObjC.unwrap(xmlNode.name)
        if (name == 'dict') {
            var xmlTracks = ObjC.unwrap(xmlNode.children).filter(
                t => ObjC.unwrap(t.name) == 'dict');
            for (var j = 0; j < xmlTracks.length; j++) {
            //for (var j = 0; j < 10; j++) {
                var track = parseTrack(ObjC.unwrap(xmlTracks[j].children))
                trackList.push(track)
            }
        }
    }
    return trackList
}

function parseTrack(xmlTrack) {
    var track = {}
    var key = ''
    for (var i = 0; i < xmlTrack.length; i++) {
        var xmlNode = xmlTrack[i]
        var name = ObjC.unwrap(xmlNode.name)
        switch (name) {
        case 'key':
            key = ObjC.unwrap(xmlNode.stringValue)
            break;
        case 'integer':
            track[key] = ObjC.unwrap(xmlNode.integerValue)
            break;
        case 'string':
            track[key] = ObjC.unwrap(xmlNode.stringValue)
            break;
        default:
            if (key == 'Disabled' && name == 'true') {
                track[key] = name
            }
            break;
        }
    }
    return track
}
