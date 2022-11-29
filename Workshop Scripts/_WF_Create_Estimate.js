function createestimate()
{
  try{
    var id= nlapiGetRecordId();
var customer= nlapiGetFieldValue('custrecord_da_customer');
var department= nlapiGetFieldValue('custrecord_da_job_card_department');
var class= nlapiGetFieldValue('custrecord_da_job_card_class');
var location= nlapiGetFieldValue('custrecord_da_workshop_location_2');
var GSX_NO = nlapiGetFieldValue('custrecord_da_gsx_number'); 
// Creating Estimate   
 var estimate = nlapiCreateRecord('estimate', {recordmode: 'dynamic', customform: 135});
 estimate.setFieldValue('entity', customer);
estimate.setFieldValue('department', department);
estimate.setFieldValue('class', class);
estimate.setFieldValue('location', location);
    estimate.setFieldValue('custbody_da_job_card_ref', id);

 var columns = new Array();
    columns[0] = new nlobjSearchColumn('internalid').setSort();
    columns[1] = new nlobjSearchColumn('custrecord_da_spare_part_item');
  columns[2] = new nlobjSearchColumn('custrecord_da_spare_part_price');
  columns[3] = new nlobjSearchColumn('custrecord_da_spare_part_new_serial');
  
    var filters = new Array();
    filters[0] = new nlobjSearchFilter('custrecord_da_spare_part_job_card', null, 'anyOf', id);
    var SearchResults = nlapiSearchRecord('customrecord_da_job_card_spare_parts', null, filters, columns);

  if (SearchResults != null && SearchResults.length > 0) {

        for (var i = 0; i < SearchResults.length; i++) {
         
            var serial_No = SearchResults[i].getValue('custrecord_da_spare_part_new_serial');
    
 
    
   
    
 estimate.selectNewLineItem('item');
 estimate.setCurrentLineItemValue('item', 'item', SearchResults[i].getValue('custrecord_da_spare_part_item'));
 
estimate.setCurrentLineItemValue('item', 'quantity', 1);
 estimate.setCurrentLineItemValue('item', 'rate', SearchResults[i].getValue('custrecord_da_spare_part_price'));
 estimate.setCurrentLineItemValue('item', 'amount', SearchResults[i].getValue('custrecord_da_spare_part_price'));
     estimate.setCurrentLineItemValue('item', 'custcol_da_trans_job_card_ref',id);
if(serial_No){
    estimate.setCurrentLineItemValue('item', 'custcol_kgb_serial_no',SearchResults[i].getText('custrecord_da_spare_part_new_serial'));

var subrec=estimate.createCurrentLineItemSubrecord('item', 'inventorydetail');
subrec.selectNewLineItem('inventoryassignment');
subrec.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', serial_No);
subrec.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
subrec.commitLineItem('inventoryassignment');
subrec.commit();
  
}
 estimate.commitLineItem('item');
}
 		var estimate_id=nlapiSubmitRecord(estimate, true, true);
    nlapiSubmitField('customrecord_da_job_cards',id,'custrecord_da_job_cards_estimate_ref', estimate_id);
     
	 //nlapiSetRedirectURL( 'RECORD', 'estimate', estimate_id, false );
     nlapiLogExecution("DEBUG","DEBUG", "estimate has been created : " +estimate_id);
    
      
  }else{
      throw nlapiCreateError('You must enter at least one line item for this transaction.');
  }}
  catch(er)
    {
      throw nlapiCreateError(er.message+" "+er.name, er.message+" "+er.name, true);
      nlapiLogExecution("DEBUG","Error",er.message+" "+er.name);
    }
}