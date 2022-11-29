/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', 'N/currentRecord', 'N/format'],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search, url, currentRecord, format) {

        /**
         * Function to be executed after page is initialized.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.mode - The mode in which the record is
         *            being accessed (create, copy, or edit)
         * 
         * @since 2015.2
         */
         function OpenPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_print_button',
            deploymentId: 'customdeploy_da_su_print_button',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function PrintButton(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_work_order_print',
            deploymentId: 'customdeploy_da_su_work_order_print',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function PickListPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_work_order_picklist',
            deploymentId: 'customdeploy_da_su_work_order_picklist',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  } 
  function AssemblyBuildPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_assembly_build_print',
            deploymentId: 'customdeploy_da_su_assembly_build_print',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function VendorReturnPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_vendor_return_print',
            deploymentId: 'customdeploy_da_su_vendor_return_print',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function TransferOrderPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_transfer_order_print',
            deploymentId: 'customdeploy_da_su_transfer_order_print',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function IFfromTransOrderPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_if_from_to_print',
            deploymentId: 'customdeploy_da_su_if_from_to_print',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function IRfromTransOrderPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_ir_from_to_print',
            deploymentId: 'customdeploy_da_su_ir_from_to_print',
          params:{
            'id':id,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function BillPaymentPrint(id,type){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_gl_impact_print',
            deploymentId: 'customdeploy_da_su_gl_impact_print',
          params:{
            'id':id,
            'type':type,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
  }
      catch(e) {
        log.error(e.name, e.message);
    }
    }
    function VendorPrePaymentPrint(id,type){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_gl_impact_print',
            deploymentId: 'customdeploy_da_su_gl_impact_print',
          params:{
            'id':id,
            'type':type,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function VendorBillPrint(id,type){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_gl_impact_print',
            deploymentId: 'customdeploy_da_su_gl_impact_print',
          params:{
            'id':id,
            'type':type,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  function BillCreditPrint(id,type){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_gl_impact_print',
            deploymentId: 'customdeploy_da_su_gl_impact_print',
          params:{
            'id':id,
            'type':type,
            'urlorigin':window.location.origin
          }
        });
      console.log('url',suiteletURL);
      window.open(suiteletURL);
      
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
        function pageInit(scriptContext) {
        }

        /**
         * Function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            try {

            }
         catch (ex) {
                console.log(ex.name, ex.message);
            }


        }

        /**
         * Function to be executed when field is slaved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * 
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or
         * edited.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @since 2015.2
         */
        function lineInit(scriptContext) {
            try {} catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        /**
         * Validation function to be executed when field is changed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * @param {string}
         *            scriptContext.fieldId - Field name
         * @param {number}
         *            scriptContext.lineNum - Line number. Will be undefined
         *            if not a sublist or matrix field
         * @param {number}
         *            scriptContext.columnNum - Line number. Will be
         *            undefined if not a matrix field
         * 
         * @returns {boolean} Return true if field is valid
         * 
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is
         * committed.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            try {
                    
            }
            catch (ex) {
                log.error(ex.name, ex.message);
            }

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @param {string}
         *            scriptContext.sublistId - Sublist name
         * 
         * @returns {boolean} Return true if sublist line is valid
         * 
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         * 
         * @param {Object}
         *            scriptContext
         * @param {Record}
         *            scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         * 
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            try {
              
            } catch (ex) {
                console.log(ex.name, ex.message);
            }

        }

        return {
            pageInit: pageInit,
            //fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit : lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            //saveRecord: saveRecord,
            OpenPrint:OpenPrint,
          PrintButton:PrintButton,
          PickListPrint:PickListPrint,
          AssemblyBuildPrint:AssemblyBuildPrint,
          VendorReturnPrint:VendorReturnPrint,
          TransferOrderPrint:TransferOrderPrint,
          IFfromTransOrderPrint:IFfromTransOrderPrint,
          IRfromTransOrderPrint:IRfromTransOrderPrint,
          BillPaymentPrint:BillPaymentPrint,
          VendorPrePaymentPrint:VendorPrePaymentPrint,
          VendorBillPrint:VendorBillPrint,
          BillCreditPrint:BillCreditPrint
        };

    });