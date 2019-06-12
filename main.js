/* jshint esversion: 6 */
/* jshint eqeqeq: true */

// Generator for getting objects from json
function* objectGenerator( filecontents ){
    var filelines = filecontents.split("\n");
    for (var i = 0; i < filelines.length; i++){
        var line = filelines[i];
        // If the line is empty, don't try to parse as JSON.
        if (line.trim() === ""){
            continue;
        }
        yield JSON.parse(line);
    }
}

// If the base Artudis URL changes, update all the download links
// on the page.
var baseURLElement = document.getElementById("baseURL");
if ( baseURLElement ){
    baseURLElement.onchange = function(){
        var links = document.getElementsByClassName("download-link");
        for (var i = 0; i < links.length; i++){
            links[i].setAttribute("href",
                links[i].getAttribute("href").replace(
                    new RegExp("^https?://[a-zA-Z.]*/"), this.value + "/")
                );
        }
    };
}

// Add a column of output to a tool
function addOutput( outputid, headertext, list ){
    var outputdiv = document.createElement("div");
    outputdiv.className = "checkoutput";
    document.getElementById(outputid).appendChild(outputdiv);

    var header = document.createElement("h3");
    header.textContent = headertext;
    outputdiv.appendChild(header);

    outputdiv.appendChild(list);
}

// Build a link to an object
function buildAnchor( object, linkcode ){
    var baseURL = document.getElementById("baseURL").value;
    var a = document.createElement("a");
    a.textContent = object.name;
    a.setAttribute("href", baseURL + "/"+ linkcode +"/" + object.__id__);
    a.setAttribute("target", "_blank");
    return a;
}

// Special case - build a link with a canned orcid search
function buildAnchorWithOrcid( object, linkcode ){
    var baseURL = document.getElementById("baseURL").value;
    var div = document.createElement("div");

    var a = document.createElement("a");
    a.textContent = object.name;
    a.setAttribute("href", baseURL + "/"+ linkcode +"/" + object.__id__);
    a.setAttribute("target", "_blank");
    div.appendChild(a);

    div.appendChild(document.createTextNode("["));
    var orcid = document.createElement("a");
    orcid.textContent = "Search ORCID";
    orcid.setAttribute("href", "https://orcid.org/orcid-search/quick-search?searchQuery=" + object.given_name + " " + object.family_name);
    orcid.setAttribute("target", "_blank");
    div.appendChild(orcid);
    div.appendChild(document.createTextNode("]"));
    return div;
}

// Special case - build a link with a canned orcid search
function buildAnchorWithCatalogueLink( object, linkcode ){
    var baseURL = document.getElementById("baseURL").value;
    var div = document.createElement("div");

    var a = document.createElement("a");
    a.textContent = object.name;
    a.setAttribute("href", baseURL + "/"+ linkcode +"/" + object.__id__);
    a.setAttribute("target", "_blank");
    div.appendChild(a);

    div.appendChild(document.createTextNode("["));
    var catlink = document.createElement("a");
    catlink.textContent = "Search catalogue";
    catlink.setAttribute("href", "http://catalogue.library.carleton.ca/search/?searchtype=t&SORT=D&searchscope=9&submit=Submit&searcharg=" + object.title);
    catlink.setAttribute("target", "_blank");
    div.appendChild(catlink);
    div.appendChild(document.createTextNode("]"));
    return div;
}

// Build a ul element from an array of objects
function buildList( objects, comparefunc, linkcode ){
    objects.sort(comparefunc);
    var list = document.createElement("ul");
    for (var i = 0; i < objects.length; i++){
        var object = objects[i];
        var li = document.createElement("li");
        li.appendChild(buildAnchor(object, linkcode));
        list.appendChild(li);
    }
    return list;
}

// Build a ul element from an array of objects, with labels.
function buildListWithLabels( objects, comparefunc, linkcode ){
    objects.sort(comparefunc);
    var list = document.createElement("ul");
    for (var i = 0; i < objects.length; i++){
        var object = objects[i];
        var li = document.createElement("li");
        li.appendChild(buildAnchor(object, linkcode));
        if (typeof object.labels !== "undefined" ){
            var label = document.createElement("span");
            for (var j = 0; j < object.labels.length; j++){
                label.textContent += object.labels[j] + " ";
            }
            li.appendChild(label);
        }
        list.appendChild(li);
    }
    return list;
}

// Build a ul element from an array of objects, with orcid links.
function buildListWithORCIDs( objects, comparefunc, linkcode ){
    objects.sort(comparefunc);
    var list = document.createElement("ul");
    for (var i = 0; i < objects.length; i++){
        var object = objects[i];
        var li = document.createElement("li");
        li.appendChild(buildAnchorWithOrcid(object, linkcode));
        list.appendChild(li);
    }
    return list;
}

// Build a ul element from an array of objects, with catalogue links.
function buildListWithCatalogueLinks( objects, comparefunc, linkcode ){
    objects.sort(comparefunc);
    var list = document.createElement("ul");
    for (var i = 0; i < objects.length; i++){
        var object = objects[i];
        var li = document.createElement("li");
        li.appendChild(buildAnchorWithCatalogueLink(object, linkcode));
        list.appendChild(li);
    }
    return list;
}

// Build a ul element from a map of strings to integers.
function buildListFromStringIntMap( map ){
    var list = document.createElement("ul");
    for (var [key, value] of map) {
        var li = document.createElement("li");
        li.textContent = key + " - " + value;
        list.appendChild(li);
    }
    return list;
}

// Build a ul element from a map of strings to integers (representing bytes)
function buildListFromStringIntMapBytes( map ){
    var list = document.createElement("ul");
    for (var [key, value] of map) {
        var li = document.createElement("li");
        li.textContent = key + " - " + (value / 1073741824).toFixed(2) + " GB";
        li.title = value + " bytes";
        list.appendChild(li);
    }
    return list;
}

// Add an object to a map.
// name -> [object(,object...)]
// If the object name isn't in the map,
// create new array of one object.
// If the object name is in the map,
// push the object to the existing array.
function addToNameMap( object, map ){
    if (map.has(object.name)){
        map.get(object.name).push(object);
    } else {
        map.set(object.name, [object]);
    }
}

// Build a ul element from an map of duplicate objects
function buildDuplicateList( duplicates, linkcode ){
    var list = document.createElement("ul");

    for (var value of duplicates.values()){
        if (value.length >= 2){
            var item = document.createElement("li");
            var sublist = document.createElement("ul");
            for (var i = 0; i < value.length; i++){
                var object = value[i];
                var li = document.createElement("li");
                li.appendChild(buildAnchor(object, linkcode));
                var span = document.createElement("span");
                span.textContent = "("+object.__id__+")";
                li.appendChild(span);
                sublist.appendChild(li);
            }
            item.appendChild(sublist);
            list.appendChild(item);
        }
    }
    return list;
}

// Build a ul element from an map of duplicate objects, with type output
// and Scopus publication ID
function buildDuplicateListWithType( duplicates, linkcode ){
    var list = document.createElement("ul");

    for (var value of duplicates.values()){
        if (value.length >= 2){
            var item = document.createElement("li");
            var type = "";
            var sublist = document.createElement("ul");
            for (var i = 0; i < value.length; i++){
                var object = value[i];
                var li = document.createElement("li");
                li.appendChild(buildAnchor(object, linkcode));
                var span = document.createElement("span");
                if (objectCheck_hasIdentifier(object, "scopus")){
                    var scopusID = "";
                    for (var j = 0; j < object.identifier.length; j++){
                       if (object.identifier[j].scheme === "scopus"){
                           scopusID = object.identifier[j].value;
                       }
                    }
                    span.textContent = "("+scopusID+")";
                } else {
                    span.textContent = "("+object.__id__+")";
                }
                li.appendChild(span);
                sublist.appendChild(li);
                type = object.type;
            }
            item.textContent = type;
            item.appendChild(sublist);
            list.appendChild(item);
        }
    }
    return list;
}

function checkKeyIsValid( object, key ){
    if ( object.hasOwnProperty(key) && typeof object[key] !== "undefined" && object[key] !== null){
        return true;
    } else {
        return false;
    }
}

// Return a list of identifier schemes which are duplicated in the a record.
function objectCheck_duplicateIdentifiers( object ){

    var duplicates = new Set();
    var setOfSchemes = new Set();

    if (checkKeyIsValid(object, "identifier")){
        for (var i = 0; i < object.identifier.length; i++){
            var scheme = object.identifier[i].scheme;
            if (setOfSchemes.has(scheme)){
                duplicates.add(scheme);
            } else {
                setOfSchemes.add(scheme);
            }
        }
    }

    return [...duplicates];
}

// Check if a object has an identifier of a particular scheme.
function objectCheck_hasIdentifier( object, schemeToCheck ){
    if (checkKeyIsValid(object, "identifier")){
        for (var i = 0; i < object.identifier.length; i++){
            var scheme = object.identifier[i].scheme;
            var value = object.identifier[i].value;
            if (scheme === schemeToCheck && value !== "undefined" && value.length > 0){
                return true;
            }
        }
    }
    return false;
}

// Compare objects by name attribute for sorting
function compareByName( one, two ){
    if (one.name < two.name)
        return -1;
    if (one.name > two.name)
        return 1;
    return 0;
}

// ----- People -----

// Compare people for sorting
function comparepeople( one,two ){
    if (one.family_name < two.family_name)
        return -1;
    if (one.family_name > two.family_name)
        return 1;
    if (one.given_name < two.given_name)
        return -1;
    if (one.given_name > two.given_name)
        return 1;
    return 0;
}

// Add an object to a map.
// employerorg -> [person(,person...)]
function addToEmployerMap( person, map ){
    if (personCheck_hasEmployer(person)){
        for (var i = 0; i < person.affiliation.length; i++){
            var affiliation = person.affiliation[i];
            if (affiliation.role === "employer" ){
                if (map.has(affiliation.organisation)){
                    map.get(affiliation.organisation).push(person);
                } else {
                    map.set(affiliation.organisation, [person]);
                }
                break;
            }
        }
    } else {
        if (map.has("None")){
            map.get("None").push(person);
        } else {
            map.set("None", [person]);
        }
    }
}

function buildListSortedEmployers( employersToPeopleMap, sublistfunc, comparefunc, linkcode ){
    var list = document.createElement("ul");
    for (var key of employersToPeopleMap.keys()){
        var item = document.createElement("li");
        item.textContent = key;
        item.appendChild(sublistfunc(employersToPeopleMap.get(key), comparefunc, linkcode));
        list.appendChild(item);
    }
    return list;
}

// Load in the local file using a FileReader.
function personCheck_Upload( file ){

    //  Clear the old output
    document.getElementById("person-output").innerHTML = "";

    // Add spinner
    if (!document.getElementById("person-input").classList.contains('loading')){
        document.getElementById("person-input").classList.add('loading');
    }

    var reader = new FileReader();
    reader.onload = function( event ){
        personCheck_Process(event.target.result);
    };
    reader.readAsText(file);
}

// Check if a person object has a work website contact.
function personCheck_hasWorkURL( person ){
    if (checkKeyIsValid(person, "contact")){
        for (var i = 0; i < person.contact.length; i++){
            var contact = person.contact[i];
            if (contact.role === "work" && typeof contact.website === "string" && contact.website.length > 1 ){
                return true;
            }
        }
    }
    return false;
}

// Check if a person object has no identifiers.
function personCheck_hasIdentifiers( person ){
    if (checkKeyIsValid(person, "identifier") && person.identifier.length > 0){
        return true;
    }
    return false;
}

// Check if a person has an employer.
function personCheck_hasEmployer( person ){
    if (checkKeyIsValid(person, "affiliation")){
        for (var i = 0; i < person.affiliation.length; i++){
            var affiliation = person.affiliation[i];
            if (affiliation.role === "employer" ){
                return true;
            }
        }
    }
    return false;
}

// Check is a person has a name alternative.
function personCheck_hasNameAlternative( person ){
    if (checkKeyIsValid(person, "name_info")){
        for (var i = 0; i < person.name_info.length; i++){
            var nameinfo = person.name_info[i];
            if (nameinfo.type === "alternative" ){
                return true;
            }
        }
    }
    return false;
}

// Check if a person's exposures all link to an entitiy.
function personCheck_exposureAllEntityLink( person ){
    if (checkKeyIsValid(person, "exposure")){
        for (var i = 0; i < person.exposure.length; i++){
            var exposure = person.exposure[i];
            if (typeof exposure.achievement !== "string" &&
                typeof exposure.organisation !== "string" &&
                typeof exposure.event !== "string"){
                return false;
            } else if (typeof exposure.achievement === "string" && exposure.achievement.charAt(0) !== "@" ){
                return false;
            } else if (typeof exposure.organisation === "string" && exposure.organisation.charAt(0) !== "@" ){
                return false;
            } else if (typeof exposure.event === "string" && exposure.event.charAt(0) !== "@" ){
                return false;
            }
        }
    }
    return true;
}

// Process the contents of the JSON file line by line.
// Find people who raise red flags.
function personCheck_Process( filecontents ){

    var withoutWorkURL = [];
    var withoutIdentifiers = [];
    var withoutEmployer = [];
    var withoutNameAlternative = [];
    var withDuplicateIdentifiers = [];
    var withoutORCID = [];
    var withExposureNoLink = [];
    var withoutISNIwithYoutube = [];

    var nameToPeople = new Map();

    var employerToPeopleWithDuplicateIdentifiers = new Map();

    for (var person of objectGenerator(filecontents)){

        person.name = person.family_name + ", " + person.given_name;

        if (!personCheck_hasWorkURL(person)) withoutWorkURL.push(person);
        if (!personCheck_hasIdentifiers(person)) withoutIdentifiers.push(person);
        if (!personCheck_hasEmployer(person)) withoutEmployer.push(person);
        if (!personCheck_hasNameAlternative(person)) withoutNameAlternative.push(person);

        person.labels = objectCheck_duplicateIdentifiers(person);
        if (person.labels.length > 0){
            withDuplicateIdentifiers.push(person);
            addToEmployerMap(person, employerToPeopleWithDuplicateIdentifiers);
        }

        if (!objectCheck_hasIdentifier(person, "orcid")) withoutORCID.push(person);
        if (!personCheck_exposureAllEntityLink(person)) withExposureNoLink.push(person);
        if ((!objectCheck_hasIdentifier(person, "isni")) &&
            (objectCheck_hasIdentifier(person, "youtube") || objectCheck_hasIdentifier(person, "youtube_channel"))) withoutISNIwithYoutube.push(person);

        addToNameMap(person, nameToPeople);
    }

    employerToPeopleWithDuplicateIdentifiers = new Map([...employerToPeopleWithDuplicateIdentifiers.entries()].sort(compareorgs));

    addOutput("person-output",
                "People without a Work Website Contact → " + withoutWorkURL.length,
                buildList(withoutWorkURL, comparepeople, "ppl"));

    addOutput("person-output",
                "People without an Identifier → " + withoutIdentifiers.length,
                buildList(withoutIdentifiers, comparepeople, "ppl"));

    addOutput("person-output",
                "People without an Employer Affiliation → " + withoutEmployer.length,
                buildList(withoutEmployer, comparepeople, "ppl"));

    if (document.getElementById("person_nonamealternative").checked){
        addOutput("person-output",
                "People without an Alternative Name → " + withoutNameAlternative.length,
                buildList(withoutNameAlternative, comparepeople, "ppl"));
    }

    addOutput("person-output",
                "People with Duplicate Identifier Schemes → " + withDuplicateIdentifiers.length,
                buildListSortedEmployers(employerToPeopleWithDuplicateIdentifiers, buildListWithLabels, comparepeople, "ppl"));

    if (document.getElementById("person_noorcid").checked){
        addOutput("person-output",
                    "People without an ORCID → " + withoutORCID.length,
                buildListWithORCIDs(withoutORCID, comparepeople, "ppl"));
    }

    addOutput("person-output",
                "People with Exposures that don't link to an Org, Event, or Achievement → " + withExposureNoLink.length,
                buildList(withExposureNoLink, comparepeople, "ppl"));

    addOutput("person-output",
                "People with Youtube channels but no ISNI → " + withoutISNIwithYoutube.length,
                buildList(withoutISNIwithYoutube, comparepeople, "ppl"));

    var duplicates = 0;
    for (var value of nameToPeople.values()){
        if (value.length >= 2){
            duplicates++;
        }
    }

    addOutput("person-output",
                "Same Name Multiple People → " + duplicates,
                buildDuplicateList(nameToPeople, "ppl"));

    // Remove spinner
    if (document.getElementById("person-input").classList.contains('loading')){
        document.getElementById("person-input").classList.remove('loading');
    }

}

var personInputElement = document.getElementById("person-input");
if (personInputElement){
    personInputElement.onchange = function(){
        personCheck_Upload(this.files[0]);
        this.value = "";
    };
}

// ----- Organizations -----

// Compare org label for sorting
function compareorgs( one,two ){

    var orgLabelOne = one[0];
    var orgLabelTwo = two[0];

    if (orgLabelOne.startsWith('@Organisation:')){
        orgLabelOne = parseInt(orgLabelOne.split(':')[1]);
    }

    if (orgLabelTwo.startsWith('@Organisation:')){
        orgLabelTwo = parseInt(orgLabelTwo.split(':')[1]);
    }

    if (orgLabelOne === "None")
        orgLabelOne = 0;
    if (orgLabelTwo === "None")
        orgLabelTwo = 0;

    if (orgLabelOne < orgLabelTwo)
        return -1;
    if (orgLabelOne > orgLabelTwo)
        return 1;
    return 0;
}

// Load in the local file using a FileReader.
function orgCheck_Upload( file ){

    // Clear the old output
    document.getElementById("org-output").innerHTML = "";

    // Add spinner
    if (!document.getElementById("org-input").classList.contains('loading')){
        document.getElementById("org-input").classList.add('loading');
    }

    var reader = new FileReader();
    reader.onload = function( event ){
        orgCheck_Process(event.target.result);
    };
    reader.readAsText(file);
}

// Check if org has a description.
function orgCheck_hasDescription( org ){
    if (checkKeyIsValid(org, "description")){
        for (var i = 0; i < org.description.length; i++){
            var description = org.description[i];
            if (description.type === "description" && description.value.length > 1 ){
                return true;
            }
        }
    }
    return false;
}

// Check if an org has a homepage.
function orgCheck_hasHomepage( org ){
    if (checkKeyIsValid(org, "contact")){
        for (var i = 0; i < org.contact.length; i++){
            var contact = org.contact[i];
            if(contact.hasOwnProperty("website") && contact.website !== null && contact.website.length > 1){
                return true;
            }
        }
    }
    return false;
}

// Check if an org has a relation
function orgCheck_hasRelation( org ){
    if (checkKeyIsValid(org, "relation") && org.relation.length > 0){
        return true;
    }
    return false;
}

// Create a map of orgs to scopus IDs
function orgNameToScopusIDs( object, map ){
    if (objectCheck_hasIdentifier(object, "scopus")){
        for (var i = 0; i < object.identifier.length; i++){
            var scheme = object.identifier[i].scheme;
            var value = object.identifier[i].value;
            if (scheme === "scopus" && value !== "undefined" && value.length > 0){
                if (map.has(object)){
                    map.get(object).push(value);
                } else {
                    map.set(object, [value]);
                }
            }
        }
    }
}

// Build a ul element from an Org map of names to ScoupsIDs
function buildOrgToScopusIDsList( map, linkcode ){
    var list = document.createElement("ul");
    for (var [key, value] of map){
        var item = document.createElement("li");
        item.appendChild(buildAnchor(key, linkcode));
        var sublist = document.createElement("ul");
        for (var i = 0; i < value.length; i++){
            var id = value[i];
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.textContent = id;
            a.setAttribute("href", "https://www.scopus.com/affil/profile.uri?afid=" + id);
            a.setAttribute("target", "_blank");
            li.appendChild(a);
            sublist.appendChild(li);
        }
        item.appendChild(sublist);
        list.appendChild(item);
    }
    return list;
}

// Process the contents of the JSON file line by line.
// Find orgs which raise red flags.
function orgCheck_Process( filecontents ){

    var withoutDescriptions = [];
    var withoutHomepages = [];
    var withoutRelation = [];
    var withDuplicateIdentifiers = [];
    var withoutScopusID = [];
    var withoutRinggoldID = [];
    var withoutISNI = [];
    var withoutISNIwithYoutube = [];

    var nameToOrg = new Map();
    var nameToScopus = new Map();

    for (var org of objectGenerator(filecontents)){

        if (!orgCheck_hasDescription(org)) withoutDescriptions.push(org);
        if (!orgCheck_hasHomepage(org)) withoutHomepages.push(org);
        if (!orgCheck_hasRelation(org)) withoutRelation.push(org);

        org.labels = objectCheck_duplicateIdentifiers(org);
        if (org.labels.length > 0){
            withDuplicateIdentifiers.push(org);
        }

        if (!objectCheck_hasIdentifier(org, "scopus")) withoutScopusID.push(org);
        if (!objectCheck_hasIdentifier(org, "ringgoldid")) withoutRinggoldID.push(org);
        if (!objectCheck_hasIdentifier(org, "isni")) withoutISNI.push(org);
        if ((!objectCheck_hasIdentifier(org, "isni")) && objectCheck_hasIdentifier(org, "youtube")) withoutISNIwithYoutube.push(org);

        addToNameMap(org, nameToOrg);
        orgNameToScopusIDs(org, nameToScopus);
    }

    addOutput("org-output",
                "Organizations without a website contact → " + withoutHomepages.length,
                buildList(withoutHomepages, compareByName, "org"));

    addOutput("org-output",
                "Organizations without any relations → " + withoutRelation.length,
                buildList(withoutRelation, compareByName, "org"));

    addOutput("org-output",
                "Organizations with Duplicate Identifier Schemes → " + withDuplicateIdentifiers.length,
                buildListWithLabels(withDuplicateIdentifiers, compareByName, "org", true));

    addOutput("org-output",
                "Organizations without Scopus ID → " + withoutScopusID.length,
                buildList(withoutScopusID, compareByName, "org"));

    addOutput("org-output",
                "Organizations without Ringgold ID → " + withoutRinggoldID.length,
                buildList(withoutRinggoldID, compareByName, "org"));

    addOutput("org-output",
                "Organizations without ISNI → " + withoutISNI.length,
                buildList(withoutISNI, compareByName, "org"));

    addOutput("org-output",
                "Organizations without ISNI, with Youtube → " + withoutISNIwithYoutube.length,
                buildList(withoutISNIwithYoutube, compareByName, "org"));

    addOutput("org-output",
                "Organizations without a description → " + withoutDescriptions.length,
                buildList(withoutDescriptions, compareByName, "org"));

    var duplicates = 0;
    for (var value of nameToOrg.values()){
        if (value.length >= 2){
            duplicates++;
        }
    }

    addOutput("org-output",
                "Same Name Multiple Organizations → " + duplicates,
                buildDuplicateList(nameToOrg, "org"));

    addOutput("org-output",
                "Organizations scopus IDs → " + nameToScopus.size,
                buildOrgToScopusIDsList(nameToScopus, "org"));

    // Remove spinner
    if (document.getElementById("org-input").classList.contains('loading')){
        document.getElementById("org-input").classList.remove('loading');
    }
}

var orgInputElement = document.getElementById("org-input");
if (orgInputElement){
    orgInputElement.onchange = function(){
        orgCheck_Upload(this.files[0]);
        this.value = "";
    };
}


// ----- Collections -----

// Load in the local file using a FileReader.
function colCheck_Upload( file ){

    // Clear the old output
    document.getElementById("col-output").innerHTML = "";

    // Add spinner
    if (!document.getElementById("col-input").classList.contains('loading')){
        document.getElementById("col-input").classList.add('loading');
    }

    var reader = new FileReader();
    reader.onload = function( event ){
        colCheck_Process(event.target.result);
    };
    reader.readAsText(file);
}

// Check if an col has a publisher
function colCheck_hasPublisher( col ){
    if (checkKeyIsValid(col, "contributor")){
        for (var i = 0; i < col.contributor.length; i++){
            var contributor = col.contributor[i];
            if(contributor.hasOwnProperty("role") && contributor.role === "publisher"){
                return true;
            }
        }
    }
    return false;
}

// Process the contents of the JSON file line by line.
// Find collections which raise red flags.
function colCheck_Process( filecontents ){

    var nameToCollection = new Map();

    var withoutPublisher = [];
    var journalWithoutXSSN = [];

    for (var col of objectGenerator(filecontents)){

        if (!colCheck_hasPublisher(col)) withoutPublisher.push(col);
        if (checkKeyIsValid(col, "type") &&
            col.type === "journal" &&
            (!objectCheck_hasIdentifier(col, "issn")) &&
            (!objectCheck_hasIdentifier(col, "essn"))) journalWithoutXSSN.push(col);

        addToNameMap(col, nameToCollection);
    }

    addOutput("col-output",
                "Collections without a publisher → " + withoutPublisher.length,
                buildList(withoutPublisher, compareByName, "col"));

    addOutput("col-output",
                "Journals without an ISSN or ESSN → " + journalWithoutXSSN.length,
                buildList(journalWithoutXSSN, compareByName, "col"));

    var duplicates = 0;
    for (var value of nameToCollection.values()){
        if (value.length >= 2){
            duplicates++;
        }
    }

    addOutput("col-output",
                "Same Name Multiple Collections → " + duplicates,
                buildDuplicateList(nameToCollection, "col"));

    // Remove spinner
    if (document.getElementById("col-input").classList.contains('loading')){
        document.getElementById("col-input").classList.remove('loading');
    }

}

var colInputElement = document.getElementById("col-input");
if ( colInputElement ){
    colInputElement.onchange = function(){
        colCheck_Upload(this.files[0]);
        this.value = "";
    };
}

// ----- Publications -----

// Add an object to a map.
function addToDOITypeMap( object, map ){
    if (checkKeyIsValid(object, "identifier")){
        for (var i = 0; i < object.identifier.length; i++){
            var scheme = object.identifier[i].scheme;
            if (scheme === "doi"){
                var doi = object.identifier[i].value;
                var finalKey = object.type + "_" + doi;
                if (map.has(finalKey)){
                    map.get(finalKey).push(object);
                } else {
                    map.set(finalKey, [object]);
                }
            }
        }
    }
}

// Compare publications for sorting
function comparepubs( one,two ){
    if (one.title < two.title)
        return -1;
    if (one.title > two.title)
        return 1;
    return 0;
}


// Load in the local file using a FileReader.
function pubCheck_Upload( file ){

    // Clear the old output
    document.getElementById("pub-output").innerHTML = "";

    // Add spinner
    if (!document.getElementById("pub-input").classList.contains('loading')){
        document.getElementById("pub-input").classList.add('loading');
    }

    var reader = new FileReader();
    reader.onload = function( event ){
        pubCheck_Process(event.target.result);
    };
    reader.readAsText(file);
}

// Check if an publication has attachment of type borrow.
function pubCheck_hasAttachmentTypeBorrow( publication ){
    if (checkKeyIsValid(publication, "attachment")){
        for (var i = 0; i < publication.attachment.length; i++){
            if (publication.attachment[i].type === "borrow"){
                return true;
            }
        }
    }
    return false;
}

// Check if an publication has a contributor of role publisher.
function pubCheck_hasContributorRolePublisher( publication ){
    if (checkKeyIsValid(publication, "contributor")){
        for (var i = 0; i < publication.contributor.length; i++){
            if (publication.contributor[i].role === "publisher"){
                return true;
            }
        }
    }
    return false;
}

// Process the contents of the JSON file line by line.
// Find publications that raise red flags.
function pubCheck_Process( filecontents ){

    var doiAndTypeToPublication = new Map();

    // store type book w/o identifier with scheme ISBN
    var booksWithoutIdentifierSchemeISBN = [];

    // store type book w/o attachment of type "borrow"
    var booksWithoutAttachmentTypeBorrow = [];

    // store type book or chapter w/o publisher
    var pubsWithoutContributorRolePublisher = [];

    // store total number of publications
    var totalNumberPubs = 0;

    // store map of type to number of attachments
    var typeToNumberAttachments = new Map();

    // store total number of attachments
    var totalNumberAttachments = 0;

    // store map of type to size of attachments
    var typeToAttachmentSize = new Map();

    // store total size of attachments
    var totalSizeOfAttachments = 0;

    // store file format to number of attachments of that format
    var fileFormatToFormatCount = new Map();

    for (var publication of objectGenerator(filecontents)){

        // Do checks on publications of type "book"
        if (publication.type === "book"){
            if (!objectCheck_hasIdentifier(publication, "isbn")) booksWithoutIdentifierSchemeISBN.push(publication);
            if (!pubCheck_hasAttachmentTypeBorrow(publication)) booksWithoutAttachmentTypeBorrow.push(publication);
        }
        // Do checks on publications of type "book" or "bookChapter"
        if (publication.type === "book" || publication.type === "bookChapter"){
            if (!pubCheck_hasContributorRolePublisher(publication)) pubsWithoutContributorRolePublisher.push(publication);
        }

        // This stores a concatinated title in the "name" key of the publication.
        publication.name = publication.title;
        if (publication.name.length > 50){
            publication.name = publication.name.substring(0, 50) + "...";
        }

        // Count the total number of publications.
        totalNumberPubs++;

        // Work with attachments to gather statistics for reporting.
        if (checkKeyIsValid(publication, "attachment")){
            for (var i = 0; i < publication.attachment.length; i++){

                // Count the number of attachments per publication type.
                if (typeToNumberAttachments.has(publication.type)){
                    typeToNumberAttachments.set(publication.type,
                        typeToNumberAttachments.get(publication.type)+1);
                } else {
                    typeToNumberAttachments.set(publication.type, 1);
                }

                // Count the total number of attachments to publications.
                totalNumberAttachments++;

                // Only do work on the bytes if valid
                var bytes = parseInt(publication.attachment[i].bytes, 10);
                if (!isNaN(bytes) && bytes > 0) {
                    // Count the bytes per publication type
                    if (typeToAttachmentSize.has(publication.type)){
                        typeToAttachmentSize.set(publication.type,
                            typeToAttachmentSize.get(publication.type)+bytes);
                    } else {
                        typeToAttachmentSize.set(publication.type, bytes);
                    }

                    // Count the number of bytes in total.
                    totalSizeOfAttachments += bytes;
                }

                // Count the number of attachments per file type.
                if (fileFormatToFormatCount.has(publication.attachment[i].format)){
                    fileFormatToFormatCount.set(publication.attachment[i].format,
                        fileFormatToFormatCount.get(publication.attachment[i].format)+1);
                } else {
                    fileFormatToFormatCount.set(publication.attachment[i].format, 1);
                }
            }
        }

        // Add the publication to the "processed" map under its DOI and type.
        // A DOI is a unique URL (web address) for that publication.
        addToDOITypeMap(publication, doiAndTypeToPublication);

    }

    // This little loop figures out how many duplicates we're dealing with.
    var duplicates = 0;
    for (var value of doiAndTypeToPublication.values()){
        if (value.length >= 2){
            duplicates++;
        }
    }

    // Output total number of publications
    var totalNumberPubsElement = document.createElement('span');
    totalNumberPubsElement.textContent = totalNumberPubs;

    addOutput("pub-output", "Number of Publications →",
              totalNumberPubsElement);

    // Output total number of attachments
    var totalNumberAttachmentsElement = document.createElement('span');
    totalNumberAttachmentsElement.textContent = totalNumberAttachments;

    addOutput("pub-output", "Total number of attachments →",
              totalNumberAttachmentsElement);

    // Output total size of attachments
    var totalSizeOfAttachmentsElement = document.createElement('span');
    totalSizeOfAttachmentsElement.textContent = (totalSizeOfAttachments / 1073741824).toFixed(2) + " GB";
    totalSizeOfAttachmentsElement.title = totalSizeOfAttachments + " bytes";

    addOutput("pub-output", "Total size of attachments →",
              totalSizeOfAttachmentsElement);

    addOutput("pub-output", "Publication type to Number of Attachments →",
              buildListFromStringIntMap(typeToNumberAttachments));

    addOutput("pub-output", "Publication type to total attachment size →",
              buildListFromStringIntMapBytes(typeToAttachmentSize));

    addOutput("pub-output", "Attachment file formats →",
              buildListFromStringIntMap(fileFormatToFormatCount));

    addOutput("pub-output",
                "Same DOI Multiple Publications of the Same Type (Scopus ID) → " + duplicates,
                buildDuplicateListWithType(doiAndTypeToPublication, "pub"));

    addOutput("pub-output",
                "Books with no ISBN Identifier → " + booksWithoutIdentifierSchemeISBN.length,
                buildList(booksWithoutIdentifierSchemeISBN, comparepubs, "pub"));

    addOutput("pub-output",
                "Books with no Attachment of type Borrow → " + booksWithoutAttachmentTypeBorrow.length,
                buildListWithCatalogueLinks(booksWithoutAttachmentTypeBorrow, comparepubs, "pub"));

    addOutput("pub-output",
                "Books or Book Chapters with no contributor of role publisher → " + pubsWithoutContributorRolePublisher.length,
                buildList(pubsWithoutContributorRolePublisher, comparepubs, "pub"));

    // Remove spinner
    if (document.getElementById("pub-input").classList.contains('loading')){
        document.getElementById("pub-input").classList.remove('loading');
    }

}

var pubInputElement = document.getElementById("pub-input");
if (pubInputElement){
    pubInputElement.onchange = function(){
        pubCheck_Upload(this.files[0]);
        this.value = "";
    };
}

// ----- Concepts -----

// Load in the local file using a FileReader.
function conceptCheck_Upload( file ){

    // Clear the old output
    document.getElementById("concept-output").innerHTML = "";

    // Add spinner
    if (!document.getElementById("concept-input").classList.contains('loading')){
        document.getElementById("concept-input").classList.add('loading');
    }

    var reader = new FileReader();
    reader.onload = function( event ){
        conceptCheck_Process(event.target.result);
    };
    reader.readAsText(file);
}

// Process the contents of the JSON file line by line.
// Find concepts that raise red flags.
function conceptCheck_Process( filecontents ){

    var schemeAndNotationToConcept = new Map();

    for (var concept of objectGenerator(filecontents)){

        var schemeAndNotation = concept.scheme + "-" + concept.notation;

        concept.name = schemeAndNotation + " " + concept.name;
        if (concept.name.length > 50){
            concept.name = concept.name.substring(0, 50) + "...";
        }

        if (schemeAndNotationToConcept.has(schemeAndNotation)){
            schemeAndNotationToConcept.get(schemeAndNotation).push(concept);
        } else {
            schemeAndNotationToConcept.set(schemeAndNotation, [concept]);
        }

    }

    // This little loop figures out how many duplicates we're dealing with.
    var duplicates = 0;
    for (var value of schemeAndNotationToConcept.values()){
        if (value.length >= 2){
            duplicates++;
        }
    }

    addOutput("concept-output",
                "Same Scheme and Notation→ " + duplicates,
                buildDuplicateList(schemeAndNotationToConcept, "concept"));

    // Remove spinner
    if (document.getElementById("concept-input").classList.contains('loading')){
        document.getElementById("concept-input").classList.remove('loading');
    }

}

var conceptInputElement = document.getElementById("concept-input");
if (conceptInputElement){
    conceptInputElement.onchange = function(){
        conceptCheck_Upload(this.files[0]);
        this.value = "";
    };
}
