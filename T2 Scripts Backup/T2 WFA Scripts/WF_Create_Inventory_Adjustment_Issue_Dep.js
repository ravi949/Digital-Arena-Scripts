function create_inventory_adjustment()
{
  try{
var subsidiary= nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary');
var department= nlapiGetFieldValue('custrecord_da_issue_mat_dep_department');
var adj_account= 218; //nlapiGetFieldValue('custrecord_da_issue_mat_dep_adj_account');
var id = nlapiGetRecordId(); 
    var inventory_adjustment = nlapiCreateRecord('inventoryadjustment');
    inventory_adjustment.setFieldValue('subsidiary',subsidiary);
inventory_adjustment.setFieldValue('department', department);
    inventory_adjustment.setFieldValue('account',adj_account);
 inventory_adjustment.setFieldValue('custbody_da_from_issue_material_to_dep',id);
 var columns = new Array();
    columns[0] = new nlobjSearchColumn('custrecord_da_issue_mat_item');
    columns[1] = new nlobjSearchColumn('custrecord_da_issue_mat_dep_location');
  columns[2] = new nlobjSearchColumn('custrecord_da_issue_mat_dep_qty');
  columns[3] = new nlobjSearchColumn('custrecord_da_issue_mat_dep_unit_price');
    var filters = new Array();
       filters[0] = new nlobjSearchFilter('custrecord_da_issue_mat_dep_id', null, 'anyOf', id); 
      
    var SearchResults = nlapiSearchRecord('customrecord_da_issue_mat_dep_items', null, filters, columns);

  if (SearchResults != null && SearchResults.length > 0) {

        for (var i = 0; i < SearchResults.length; i++) {
    
 
    
   

 inventory_adjustment.selectNewLineItem('inventory');
 inventory_adjustment.setCurrentLineItemValue('inventory', 'item', SearchResults[i].getValue('custrecord_da_issue_mat_item'));
 inventory_adjustment.setCurrentLineItemValue('inventory', 'location', SearchResults[i].getValue('custrecord_da_issue_mat_dep_location'));
 inventory_adjustment.setCurrentLineItemValue('inventory', 'department', department);
 inventory_adjustment.setCurrentLineItemValue('inventory', 'adjustqtyby',parseInt(SearchResults[i].getValue('custrecord_da_issue_mat_dep_qty'))*-1);
 inventory_adjustment.setCurrentLineItemValue('inventory', 'unitcost', parseFloat(SearchResults[i].getValue('custrecord_da_issue_mat_dep_unit_price')));
 inventory_adjustment.commitLineItem('inventory');
}
var inv_adjust_id=nlapiSubmitRecord(inventory_adjustment,true,true);
    }
nlapiSubmitField('customrecord_da_issue_material_to_dep',id,'custrecord_da_inventory_adjust_ref',inv_adjust_id,true,true);
   nlapiSubmitField('customrecord_da_issue_material_to_dep',id,'custrecord_da_issue_mat_to_dep_status',2,true,true);//approved
   
  }
  catch(er)
    {
      nlapiLogExecution("DEBUG","Error",er.message);
    }
}