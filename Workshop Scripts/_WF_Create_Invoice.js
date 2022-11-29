function createinvoice()
{
  try{ 
  
    if(!nlapiGetFieldValue('custrecord_da_job_cards_invoice_ref')  ){
     
         
    var id= nlapiGetRecordId();
var customer= nlapiGetFieldValue('custrecord_da_customer');
var department= nlapiGetFieldValue('custrecord_da_job_card_department');
var class= nlapiGetFieldValue('custrecord_da_job_card_class');
var location= nlapiGetFieldValue('custrecord_da_workshop_location_2');
var GSX_NO = nlapiGetFieldValue('custrecord_da_gsx_number'); 
// Creating Invoice   
 var invoice = nlapiCreateRecord('invoice', {recordmode: 'dynamic', customform: 155});
 invoice.setFieldValue('entity', customer);
invoice.setFieldValue('department', department);
invoice.setFieldValue('class', class);
invoice.setFieldValue('location', location);
    invoice.setFieldValue('custbody_da_job_card_ref', id);

 var columns = new Array();
    columns[0] = new nlobjSearchColumn('internalid').setSort();
    columns[1] = new nlobjSearchColumn('custrecord_da_spare_part_item');
  columns[2] = new nlobjSearchColumn('custrecord_da_spare_part_price');
  columns[3] = new nlobjSearchColumn('custrecord_da_spare_part_kgb_text');
  
      columns[5] = new nlobjSearchColumn('custrecord_da_spare_part_item_type');
       columns[6] = new nlobjSearchColumn('custrecord_da_spare_part_new_serial');
      
    var filters = new Array();
       filters[0] = new nlobjSearchFilter('custrecord_da_spare_part_job_card', null, 'anyOf', id); 
       
    var SearchResults = nlapiSearchRecord('customrecord_da_job_card_spare_parts', null, filters, columns);

  if (SearchResults != null && SearchResults.length > 0) {

        for (var i = 0; i < SearchResults.length; i++) {
         
            var serial_No = SearchResults[i].getValue('custrecord_da_spare_part_new_serial');
      nlapiLogExecution("DEBUG","serial_No" ,SearchResults[i].getValue('custrecord_da_spare_part_new_serial'));
    var item = SearchResults[i].getValue('custrecord_da_spare_part_item');
            
                var type = SearchResults[i].getValue('custrecord_da_spare_part_item_type');
          if(type == 1){
             var columns_qty = new Array();
             columns_qty[0] = new nlobjSearchColumn('locationquantityonhand');
            columns_qty[1] = new nlobjSearchColumn('internalid');
            var filters_qty = new Array();
            filters_qty[0] = new nlobjSearchFilter('internalid', null, 'anyOf', item);
            filters_qty[1] = new nlobjSearchFilter('inventorylocation', null, 'anyOf', location);


            var searchresults_qty = nlapiSearchRecord('item', null, filters_qty, columns_qty);

          
                var quantity_on_hand = parseInt(searchresults_qty[0].getValue('locationquantityonhand'));
                var qty = 1;
               if (qty > quantity_on_hand || !quantity_on_hand ) {
                     throw nlapiCreateError('Sorry you cannot create invoice , Some of items do not have quantity available'+' '+':'+searchresults_qty[0].getValue('internalid') +'.');     
                    }
            }
   
 invoice.selectNewLineItem('item');
 invoice.setCurrentLineItemValue('item', 'item', SearchResults[i].getValue('custrecord_da_spare_part_item'));
//invoice.setCurrentLineItemValue('item', 'location', location);
 
invoice.setCurrentLineItemValue('item', 'quantity', 1);
 invoice.setCurrentLineItemValue('item', 'rate', SearchResults[i].getValue('custrecord_da_spare_part_price'));
 invoice.setCurrentLineItemValue('item', 'amount', SearchResults[i].getValue('custrecord_da_spare_part_price'));
     invoice.setCurrentLineItemValue('item', 'custcol_da_trans_job_card_ref',id);
           invoice.setCurrentLineItemValue('item', 'custcol_kgb_serial_no',SearchResults[i].getValue('custrecord_da_spare_part_kgb_text'));

/*if(serial_No){
   var item = SearchResults[i].getValue('custrecord_da_spare_part_item');
var subrec=invoice.createCurrentLineItemSubrecord('item', 'inventorydetail');
subrec.selectNewLineItem('inventoryassignment');
subrec.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', serial_No);
subrec.setCurrentLineItemValue('inventoryassignment', 'quantity', 1);
    subrec.commitLineItem('inventoryassignment');
subrec.commit();

    nlapiLogExecution("DEBUG","test" ,subrec);
}*/
 invoice.commitLineItem('item');
        
}
 		var inv_id=nlapiSubmitRecord(invoice, true, true);
    
	nlapiLogExecution("DEBUG","DEBUG", "Invoice has been created : " +inv_id);
 nlapiSubmitField('customrecord_da_job_cards',id,'custrecord_da_job_cards_invoice_ref', inv_id);
     // nlapiSetRedirectURL( 'RECORD', 'invoice', inv_id, false );
  }else{
      throw nlapiCreateError('You must enter at least one line item for this transaction.');
  }}}
  catch(er)
    {
        throw nlapiCreateError(er.message+" "+er.name, er.message+" "+er.name, true);
      nlapiLogExecution("DEBUG","Error",er.message+" "+er.name);
    }
}