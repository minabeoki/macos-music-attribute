#!/usr/bin/env osascript -l JavaScript

function run() {
    const filename = 'iTunes Music Library.xml';
    let trackList = readXML(filename);
    console.log('iTunes Tracks :', trackList.length);

    let musicApp = Application('Music');
    let allTracks = musicApp.playlists[1].tracks;

    for (let i = 0; i < allTracks.length; i++) {
        let name = allTracks[i].name();
        let album = allTracks[i].album();

        let found = trackList.find((trk) => {
            return trk.Name == name && trk.Album == album;
        });

        if (found !== undefined) {
            console.log(found.Name, '/', found.Album);
            if ('Rating' in found) {
                allTracks[i].rating = found.Rating;
            }
            if ('Disabled' in found) {
                allTracks[i].enabled = false;
            }
            if ('Play Count' in found) {
                allTracks[i].playedCount = found['Play Count'];
            }
            if ('Volume Adjustment' in found) {
                // The range on the iTunes and Music UI is from -100% to 100%,
                // but internal value may be from -255 to 255.
                let vol = found['Volume Adjustment'] * 100 / 255;
                allTracks[i].volumeAdjustment = vol;
            }
        }
    }
}

function readXML(filename) {
    let app = Application.currentApplication();
    app.includeStandardAdditions = true;
    let xmldata = $.NSString.stringWithContentsOfFileEncodingError(
        $(filename).stringByStandardizingPath,
        $.NSUTF8StringEncoding,
        $()
    ).js

    let xmlDoc = $.NSXMLDocument.alloc.initWithXMLStringOptionsError(xmldata, 0, null);
    let xmlRoot = xmlDoc.rootElement;
    let xmlBody = ObjC.unwrap(xmlRoot.children)[0];
    let xmlList =  ObjC.unwrap(xmlBody.children);

    let trackList = [];
    for (let i = 0; i < xmlList.length; i++) {
        let xmlNode = xmlList[i];
        let name = ObjC.unwrap(xmlNode.name);
        if (name == 'dict') {
            let xmlTracks = ObjC.unwrap(xmlNode.children).filter(
                t => ObjC.unwrap(t.name) == 'dict');
            for (let j = 0; j < xmlTracks.length; j++) {
                let track = parseTrack(ObjC.unwrap(xmlTracks[j].children));
                trackList.push(track);
            }
        }
    }
    return trackList;
}

function parseTrack(xmlTrack) {
    let track = {};
    let key = '';
    for (let i = 0; i < xmlTrack.length; i++) {
        let xmlNode = xmlTrack[i];
        let name = ObjC.unwrap(xmlNode.name);
        switch (name) {
        case 'key':
            key = ObjC.unwrap(xmlNode.stringValue);
            break;
        case 'integer':
            track[key] = ObjC.unwrap(xmlNode.objectValue);
            break;
        case 'string':
            track[key] = ObjC.unwrap(xmlNode.stringValue);
            break;
        default:
            if (key == 'Disabled') {
                track[key] = name;
            }
            break;
        }
    }
    return track;
}
