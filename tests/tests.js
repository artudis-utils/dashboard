/* Object Check Tests */

QUnit.test( "objectCheck_duplicateIdentifiers", function( assert ) {

    var hasDuplicateIdentifiers =  {
        "identifier":[
            {
                "scheme":"scopus"
            },
            {
                "scheme":"scopus"
            },
            {
                "scheme":"scopus"
            },
            {
                "scheme":"notscopus"
            }
        ]
    }
    assert.deepEqual(objectCheck_duplicateIdentifiers(hasDuplicateIdentifiers), ['scopus'], "correct list of duplicated identifiers");

    var noDuplicateIdentifiers =  {
        "identifier":[
            {
                "scheme":"scopus1"
            },
            {
                "scheme":"scopus2"
            },
            {
                "scheme":"scopus3"
            },
            {
                "scheme":"scopus4"
            }
        ]
    }
    assert.deepEqual(objectCheck_duplicateIdentifiers(noDuplicateIdentifiers), [], "empty list, no duplicates");

});

QUnit.test( "objectCheck_hasIdentifier", function( assert ) {

    hasORCID = {
        "identifier": [
            {
                "scheme":"scopus",
                "value":"23481725900"
            },
            {
                "scheme":"scholar",
                "value":"kJLdIjgAAAAJ"
            },
            {
                "scheme":"orcid",
                "value":"0000-0003-3978-5792"
            }
        ]
    }
    assert.ok(objectCheck_hasIdentifier(hasORCID, "orcid"), "return true since has orcid");

    noORCID = {
        "identifier": [
            {
                "scheme":"scopus",
                "value":"23481725900"
            },
            {
                "scheme":"scholar",
                "value":"kJLdIjgAAAAJ"
            }
        ]
    }
    assert.notOk(objectCheck_hasIdentifier(noORCID, "orcid"), "return false since no orcid");

    emptyIdentifierValue = {
        "identifier": [
            {
                "scheme":"scopus",
                "value":""
            }
        ]
    }
    assert.notOk(objectCheck_hasIdentifier(emptyIdentifierValue, "scopus"), "return false since identifier value is empty");

    emptyIdentifier = {
        "identifier": []
    }
    assert.notOk(objectCheck_hasIdentifier(emptyIdentifier, "orcid"), "return false since empty identifier list");

});

/* Person Check Tests */

QUnit.test( "personCheck_hasWorkURL", function( assert ) {

    var hasWorkURL = {
        "contact": [
            {
                "website": "http:\/\/carleton.ca\/chemistry\/people\/barry-sean\/",
                "role": "work"
            }
        ]
    }
    assert.ok( personCheck_hasWorkURL(hasWorkURL), "returned true when there was a work website link");

    var emptyWorkURL = {
        "contact": [
            {
                "website": "",
                "role": "work"
            }
        ]
    }
    assert.notOk( personCheck_hasWorkURL(emptyWorkURL), "returned false when there was a work contact but no website link");

    var nullWorkURL = {
        "contact": [
            {
                "website": null,
                "role": "work"
            }
        ]
    }
    assert.notOk( personCheck_hasWorkURL(nullWorkURL), "returned false when there was a work contact but website link is null");

    var emptyContact = {
        "contact": []
    }
    assert.notOk( personCheck_hasWorkURL(emptyContact), "returned false when contacts were empty");

    var noWorkURL = {
        "contact": [
            {
                "website": "http:\/\/personal.ca\/",
                "role": "personal"
            }
        ]
    }
    assert.notOk( personCheck_hasWorkURL(noWorkURL), "returned false when there was NOT a work website link");
});

QUnit.test( "personCheck_hasIdentifiers", function( assert ) {

    var hasIdentifiers = {
        "identifier": [
            {
                "scheme": "scopus",
                "value": "123456"
            }
        ]
    }
    assert.ok( personCheck_hasIdentifiers(hasIdentifiers), "returned true when there were identifiers");


    var noIdentifiers = {}
    assert.notOk( personCheck_hasIdentifiers(noIdentifiers), "returned false when there were no identifiers");


    var emptyIdentifiers = {
        "identifier": []
    }
    assert.notOk( personCheck_hasIdentifiers(emptyIdentifiers), "returned false when there was an empty identifier list");
});

QUnit.test( "personCheck_hasEmployer", function( assert ) {

    var hasEmployer = {
        "affiliation": [
            {
              "organisation": "@Organisation:62",
              "role": "employer"
            }
        ]
    }
    assert.ok(personCheck_hasEmployer(hasEmployer), "returned true when person had employer");

    var noAffiliation = {}
    assert.notOk( personCheck_hasEmployer(noAffiliation), "returned false when there was no affiliation key");

    var emptyAffiliation = {
        "affiliation": []
    }
    assert.notOk( personCheck_hasEmployer(emptyAffiliation), "returned false when the affiliation was empty");

    var noEmployerAffiliation = {
        "affiliation": [
            {
              "organisation": "@Organisation:62",
              "role": "mentor"
            }
        ]
    }
    assert.notOk( personCheck_hasEmployer(noEmployerAffiliation), "returned false when there was no affilication of role employer");
});

QUnit.test( "personCheck_hasNameAlternative", function( assert ) {

    var hasNameVariant = {
        "name_info":[
            {
                "type":"alternative",
                "value":"Alternative Name, My"
            }
        ]
    }
    assert.ok(personCheck_hasNameAlternative(hasNameVariant), "returned true when person has alternative name");

    var hasNoNameVariant = {
        "name_info":[
            {
                "type":"honorific",
                "value":"Honorific, My"
            }
        ]
    }
    assert.notOk(personCheck_hasNameAlternative(hasNoNameVariant), "returned false when person has no alternative name");

    var emptyNameInfo = {
        "name_info":[]
    }
    assert.notOk(personCheck_hasNameAlternative(emptyNameInfo), "returned false when person's name_info was empty");

});

QUnit.test( "personCheck_exposureAllEntityLink", function( assert ) {

    allExposureLinksEntity = {
        "exposure":[
            {
                "event":"@Event:2",
                "publication":null,
                "end_date":null,
                "organisation":null,
                "collection":null,
                "public":"false",
                "note":null,
                "location":null,
                "type":"contributor",
                "start_date":null,
                "achievement":null,
                "name":null
            },
            {
                "event":null,
                "publication":null,
                "end_date":null,
                "organisation":"@Organisation:1",
                "collection":null,
                "public":"false",
                "note":null,
                "location":null,
                "type":"contributor",
                "start_date":null,
                "achievement":null,
                "name":null
            }
        ]
    }
    assert.ok(personCheck_exposureAllEntityLink(allExposureLinksEntity), "all exposures link to an entity");

    allExposureLinksStrings = {
        "exposure":[
            {
                "event":"An Event",
                "publication":null,
                "end_date":null,
                "organisation":null,
                "collection":null,
                "public":"false",
                "note":null,
                "location":null,
                "type":"contributor",
                "start_date":null,
                "achievement":null,
                "name":null
            }
        ]
    }
    assert.notOk(personCheck_exposureAllEntityLink(allExposureLinksStrings), "no exposures link to an entity");

    noExposures = {}
    assert.ok(personCheck_exposureAllEntityLink(noExposures), "no exposures");

    emptyExposures = {
        "exposure":[]
    }
    assert.ok(personCheck_exposureAllEntityLink(emptyExposures), "no exposures");

});

/* Org Check Tests */

QUnit.test( "orgCheck_hasDescription", function ( assert ) {

    hasDescription = {
        "description": [
            {
                "type":"description",
                "value":"Mobility & Politics Research Collective (\u201cMobPoli\u201d) has more than 60 members and has become a transnational hub for research on migration, mobility, refugees and borders with collaborators around the globe, headquartered in at Carleton's department of Political Science. The collective brings students, researchers and practitioners together for live broadcast sessions and it promotes collaborative learning, research and dissemination across borders, cultures and disciplinary boundaries.",
                "format":"markdown"
            },
            {
                "type":"comment",
                "value":"https://mobilitypoliticsseries.com/portfolio/published-works/",
                "format":"text"
            }
        ]
    }
    assert.ok(orgCheck_hasDescription(hasDescription), "return true since org has description");

    noDescription = {
        "description": [
            {
                "type":"comment",
                "value":"https://mobilitypoliticsseries.com/portfolio/published-works/",
                "format":"text"
            }
        ]
    }
    assert.notOk(orgCheck_hasDescription(noDescription), "return false since org does not have description");

    emptyDescription = {
        "description": []
    }
    assert.notOk(orgCheck_hasDescription(emptyDescription), "return false since org has an empty description");

    nullDescription = {}
    assert.notOk(orgCheck_hasDescription(nullDescription), "return false since org is missing a description");

});

QUnit.test( "orgCheck_hasHomepage", function ( assert ) {

    hasHomepage = {
        "contact": [
            {
                "website":"https://carleton.ca/its",
                "role":"work"
            }
        ]
    }
    assert.ok(orgCheck_hasHomepage(hasHomepage), "return true since org has a homepage");

    noHomepage = {
        "contact": [
            {
                "website":"",
                "role":"work"
            },
            {
                "website":null
            },
        ]
    }
    assert.notOk(orgCheck_hasHomepage(noHomepage), "return false since org does not have a homepage");

    emptyHomepage = {
        "contact": []
    }
    assert.notOk(orgCheck_hasHomepage(emptyHomepage), "return false since org has an empty contact list");

    nullHomepage = {}
    assert.notOk(orgCheck_hasHomepage(nullHomepage), "return false since org is missing a contact list");

});

QUnit.test( "orgCheck_hasRelation", function( assert ) {

    hasRelation = {
        "relation":[
            {
                "organisation":"@Organisation:3",
                "role":"partOf",
            }
        ]
    }
    assert.ok(orgCheck_hasRelation(hasRelation), "return true since org has relation");

    emptyRelation = {
        "relation":[]
    }
    assert.notOk(orgCheck_hasRelation(emptyRelation), "return false since org has empty relations");

    noRelation = {
    }
    assert.notOk(orgCheck_hasRelation(noRelation), "return true since org has no relations");

});

/* Collection Check Tests */

QUnit.test( "colCheck_hasPublisher", function( assert ) {

    hasContributorRolePublisher = {
       "contributor": [
            {
                "role": "publisher"
            }
        ]
    }
    assert.ok(colCheck_hasPublisher(hasContributorRolePublisher), "return true since col has contributor with role publisher");

    hasContributorRoleNotPublisher = {
       "contributor": [
            {
                "role": "xoxoxoxo"
            }
        ]
    }
    assert.notOk(colCheck_hasPublisher(hasContributorRoleNotPublisher), "return false since col has contributor with role xoxox, not publisher");

    hasEmptyContributor = {
       "contributor": []
    }
    assert.notOk(colCheck_hasPublisher(hasEmptyContributor), "return false since col has contributor which is empty");

    hasNoContributor = {}
    assert.notOk(colCheck_hasPublisher(hasNoContributor), "return false since col has no contributor");

});

/* Pub Check Tests */

QUnit.test( "pubCheck_hasAttachmentTypeBorrow", function( assert ) {

    hasAttachmentTypeBorrow = {
        "attachment": [
            {
                "type":"borrow"
            }
        ]
    }
    assert.ok(pubCheck_hasAttachmentTypeBorrow(hasAttachmentTypeBorrow), "return true since pub has attachment type borrow");

    hasAttachmentNotBorrow = {
        "attachment": [
            {
                "type":"notborrow"
            }
        ]
    }
    assert.notOk(pubCheck_hasAttachmentTypeBorrow(hasAttachmentNotBorrow), "return false since pub has attachment type notborrow");

    emptyAttachment = {
        "attachment": []
    }
    assert.notOk(pubCheck_hasAttachmentTypeBorrow(emptyAttachment), "return false since pub has empty attachment");

    noAttachment = {}
    assert.notOk(pubCheck_hasAttachmentTypeBorrow(noAttachment), "return false since pub has no attachment");

});

QUnit.test( "pubCheck_hasContributorRolePublisher", function( assert ) {

    hasContributorRolePublisher = {
        "contributor": [
            {
                "role":"somesuch"
            },
            {
                "role":"publisher"
            }
        ]
    }
    assert.ok(pubCheck_hasContributorRolePublisher(hasContributorRolePublisher), "return true since pub has contributor with role publisher");

    hasContributorRoleNotPublisher = {
        "contributor": [
            {
                "role":"notpublisher"
            }
        ]
    }
    assert.notOk(pubCheck_hasContributorRolePublisher(hasContributorRoleNotPublisher), "return false since pub has contributor with role != publisher");

    emptyContributor = {
        "contributor": []
    }
    assert.notOk(pubCheck_hasContributorRolePublisher(emptyContributor), "return false since pub has empty contributor");

    noContributor = {}
    assert.notOk(pubCheck_hasContributorRolePublisher(noContributor), "return false since pub has no contributor");

});

QUnit.test( "pubCheck_hasRelationRoleSeeAlso", function( assert ) {

    hasRelationRoleSeeAlso = {
        "relation": [
            {
                "role":"seeAlso"
            },
            {
                "role":"publisher"
            }
        ]
    }
    assert.ok(pubCheck_hasRelationRoleSeeAlso(hasRelationRoleSeeAlso), "return true since pub has relation with role seeAlso");

    hasRelationRoleNotSeeAlso = {
        "relation": [
            {
                "role":"overhere"
            }
        ]
    }
    assert.notOk(pubCheck_hasRelationRoleSeeAlso(hasRelationRoleNotSeeAlso), "return false since pub has relation with role != seeAlso");

    emptyRelation = {
        "relation": []
    }
    assert.notOk(pubCheck_hasRelationRoleSeeAlso(emptyContributor), "return false since pub has empty relation");

    noRelation = {}
    assert.notOk(pubCheck_hasRelationRoleSeeAlso(noContributor), "return false since pub has no relation");

});
