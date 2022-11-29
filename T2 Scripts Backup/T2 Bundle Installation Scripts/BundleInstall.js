/**
 * � 2015 NetSuite Inc.  User may not copy, modify, distribute, or re-bundle or otherwise make available this code. 
 */

/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Nov 2013     jvelasquez
 *
 */

/**
 * @param {Number}
 *        toversion
 * @returns {Void}
 */
function afterInstall(toversion) {

    try {
        // create a StickyNotes File Html record
        var fileHtmlCodes = stickGetRecordPageCodeHtml();
        var rec = nlapiCreateRecord('customrecord_stick_file_html');
        rec.setFieldValue('custrecord_snfhf_file_codes', fileHtmlCodes);
        nlapiSubmitRecord(rec);
    } catch (e) {
        stickHandleError(e, 'Error in afterInstall; setting fileHtmlCodes');
    }

    // //Create Sticky Note Small Size
    // var recStickNoteSize = nlapiCreateRecord('customrecord_stick_note_size');
    // recStickNoteSize.setFieldValue('name', 'Small');
    // recStickNoteSize.setFieldValue('custrecord_snz_height', '150');
    // recStickNoteSize.setFieldValue('custrecord_snz_width', '150');
    // nlapiSubmitRecord(recStickNoteSize);
    //
    // //Create Sticky Note Medium Size
    // recStickNoteSize = nlapiCreateRecord('customrecord_stick_note_size');
    // recStickNoteSize.setFieldValue('name', 'Medium');
    // recStickNoteSize.setFieldValue('custrecord_snz_height', '250');
    // recStickNoteSize.setFieldValue('custrecord_snz_width', '250');
    // nlapiSubmitRecord(recStickNoteSize);
    //
    // //Create Sticky Note Large Size
    // recStickNoteSize = nlapiCreateRecord('customrecord_stick_note_size');
    // recStickNoteSize.setFieldValue('name', 'Large');
    // recStickNoteSize.setFieldValue('custrecord_snz_height', '350');
    // recStickNoteSize.setFieldValue('custrecord_snz_width', '350');
    // nlapiSubmitRecord(recStickNoteSize);
    //	
    // //Create Small Font Size
    // var recStickFontSize = nlapiCreateRecord('customrecord_stick_font_size');
    // recStickFontSize.setFieldValue('name', 'Small');
    // recStickFontSize.setFieldValue('custrecord_sfs_font_size', '0.5');
    // nlapiSubmitRecord(recStickFontSize);
    //
    // //Create Normal Font Size
    // recStickFontSize = nlapiCreateRecord('customrecord_stick_font_size');
    // recStickFontSize.setFieldValue('name', 'Normal');
    // recStickFontSize.setFieldValue('custrecord_sfs_font_size', '1');
    // nlapiSubmitRecord(recStickFontSize);
    //
    // //Create Large Font Size
    // recStickFontSize = nlapiCreateRecord('customrecord_stick_font_size');
    // recStickFontSize.setFieldValue('name', 'Large');
    // recStickFontSize.setFieldValue('custrecord_sfs_font_size', '1.5');
    // nlapiSubmitRecord(recStickFontSize);

    // Create category records
    var recordTypeScriptId = 'customrecord_stick_note_category';
    // high importance - red
    r = nlapiCreateRecord(recordTypeScriptId);
    r.setFieldValue('name', 'High');
    r.setFieldValue('custrecord_snc_priority', 1);
    r.setFieldValue('custrecord_snc_color', '#FFE5E7');
    nlapiSubmitRecord(r);

    // yellow
    r = nlapiCreateRecord(recordTypeScriptId);
    r.setFieldValue('name', 'Normal');
    r.setFieldValue('custrecord_snc_priority', 5);
    r.setFieldValue('custrecord_snc_color', '#FEFBE5');
    nlapiSubmitRecord(r);

    // green
    var r = nlapiCreateRecord(recordTypeScriptId);
    r.setFieldValue('name', 'Low');
    r.setFieldValue('custrecord_snc_priority', 9);
    r.setFieldValue('custrecord_snc_color', '#E5FFE6');
    nlapiSubmitRecord(r);

    stickSetScriptDeploymentsLogLevelToError();

    // create file drag and drop folder
    stickCreateFileDragAndDropFolder();
}

function checkDependencies() {
    // do not attempt to do translation since the required files are not yet
    // copied at this point
    var objContext = nlapiGetContext();
    var customcode_enabled = objContext.getSetting("FEATURE", "CUSTOMCODE");
    if (customcode_enabled != 'T') {
        throw new nlobjError('INSTALLATION_ERROR', 'Client SuiteScript Feature must first be enabled before installation.');
    }

    var serversidescripting_enabled = objContext.getSetting("FEATURE", "SERVERSIDESCRIPTING");
    if (serversidescripting_enabled != 'T') {
        throw new nlobjError('INSTALLATION_ERROR', 'Server SuiteScript Feature must first be enabled before installation.');
    }

    // not needed for org chart
    var customrecords_enabled = objContext.getSetting("FEATURE", "CUSTOMRECORDS");
    if (customrecords_enabled != 'T') {
        throw new nlobjError('INSTALLATION_ERROR', 'Custom Records Feature must first be enabled before installation.');
    }
}

/**
 * @param {Number}
 *        toversion
 * @returns {Void}
 */
function beforeInstall(toversion) {
    checkDependencies();
}

/**
 * @param {Number}
 *        fromversion
 * @param {Number}
 *        toversion
 * @returns {Void}
 */
function afterUpdate(fromversion, toversion) {

    var logger = new stickobjLogger(arguments);

    try {
        var columns = [];
        columns.push(new nlobjSearchColumn('custrecord_snfhf_file_codes'));
        var results = nlapiSearchRecord('customrecord_stick_file_html', null, null, columns);
        var fileHtmlCodes = stickGetRecordPageCodeHtml();
        logger.log(fileHtmlCodes);
        if (results === null) {
            // create
            var rec = nlapiCreateRecord('customrecord_stick_file_html');
            rec.setFieldValue('custrecord_snfhf_file_codes', fileHtmlCodes);
            nlapiSubmitRecord(rec);
        } else {
            // update
            nlapiSubmitField('customrecord_stick_file_html', results[0].getId(), 'custrecord_snfhf_file_codes', fileHtmlCodes);
        }
    } catch (e) {
        stickHandleError(e, 'Error in afterUpdate, setting fileHtmlCodes');
    }

    stickSetScriptDeploymentsLogLevelToError();
    
    // create file drag and drop folder
    stickCreateFileDragAndDropFolder();
}

/**
 * Updates deployments logging to ERROR
 */
function stickSetScriptDeploymentsLogLevelToError() {
    try {
        // get all script deployments that are not set to ERROR
        var filters = [];
        filters.push([ "loglevel", "noneof", "ERROR" ]);
        filters.push("and");
        filters.push([ "script.isinactive", "is", "F" ]);
        filters.push("and");
        filters.push([ "script.scriptid", "startswith", "customscript_stick_" ]);
        var results = nlapiSearchRecord("scriptdeployment", null, filters);
        if (results === null) {
            return;
        }
        for (var i = 0; i < results.length; i++) {
            // catch each result's error so as to continue with the next
            try {
                var deployId = results[i].getId();
                nlapiLogExecution("DEBUG", 'scheduled', "deployId = " + deployId);
                // set log level to ERROR
                nlapiSubmitField("scriptdeployment", deployId, "loglevel", "ERROR");
            } catch (e) {
                stickHandleError(e, 'Error in stickSetScriptDeploymentsLogLevelToError()');
            }
        }

    } catch (e) {
        stickHandleError(e, 'Error in stickSetScriptDeploymentsLogLevelToError');
    }
}

/**
 * Creates the File Drag and Drop folder for StickyNotes, if not yet created.
 * The folder is restricted to only be accessed by Administrators.
 * 
 * @return {void}
 */
function stickCreateFileDragAndDropFolder() {
    var folderName = stickGlobal.FILE_DRAG_AND_DROP_FOLDER_NAME;

    // check if folder already exists
    var filters = [];
    filters.push(new nlobjSearchFilter("name", null, "is", folderName));
    var results = nlapiSearchRecord("folder", null, filters);
    if (stickHasValue(results)) {
        return;
    }

    // create folder
    var folder = nlapiCreateRecord('folder');
    folder.setFieldValue('name', folderName);
    folder.setFieldValue('group', stickCreateAdminGroup());
    nlapiSubmitRecord(folder, true);
}

/**
 * Creates a Group record (if not yet created) that consists of Administrators,
 * and returns the internal id of the Group record to be used as restriction in
 * the File Drag and Drop folder
 * 
 * @return {Number} Internal id of the Group record
 */
function stickCreateAdminGroup() {
    var groupName = "StickyNotes Admin Group";

    // check if admin group already exists
    var filters = [];
    filters.push([ "groupname", "is", groupName ]);
    var results = nlapiSearchRecord("entitygroup", null, filters);
    if (stickHasValue(results)) {
        return results[0].getId();
    }

    // create admin group
    var record = nlapiCreateRecord("entitygroup", {
        grouptype : "Employee",
        "dynamic" : "T"
    });
    record.setFieldValue("groupname", groupName);
    record.setFieldValue("savedsearch", stickGetAdminSavedSearch());
    var id = nlapiSubmitRecord(record);
    return id;
}

/**
 * Gets the internal id of the saved search that returns the Administrators of
 * the account. Throws an error if the saved search is not found.
 * 
 * @return {Number} Internal id of the saved search
 */
function stickGetAdminSavedSearch() {
    // get admin saved search internal id
    var search = null;
    try {
        search = nlapiLoadSearch('employee', 'customsearch_stickynotes_folder_access');
    } catch (e) {
    }
    if (stickHasValue(search)) {
        return search.getId();
    }
    // throw error if not found
    throw nlapiCreateError("ADMIN_SAVED_SEARCH_NOT_FOUND", "StickyNotes Folder Access Search is not found.");
}
