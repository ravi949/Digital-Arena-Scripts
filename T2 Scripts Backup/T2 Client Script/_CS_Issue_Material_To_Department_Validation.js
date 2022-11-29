function pageint(type) {
  try {
    if(type =='edit'){
    if ( nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary') ) {
      
		var subsidiary = nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary');
	
 
		nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id',
				'custrecord_da_issue_mat_dep_lisubsidiary', subsidiary, true, true);

    }
       nlapiCancelLineItem('recmachcustrecord_da_issue_mat_dep_id');   
  }
  }catch(e){
		}
	} 

function fieldChanged(type, name, linenum) {
try{
     if ( name == 'custrecord_da_issue_mat_dep_department' && nlapiGetFieldValue('custrecord_da_issue_mat_dep_department')||name == 'custrecord_da_issue_mat_dep_subsidiary' && nlapiGetFieldValue('custrecord_da_issue_mat_dep_department')) {
           
            
         

            var filters_3 = new Array();
            filters_3[0] = new nlobjSearchFilter('subsidiary', null, 'anyOf',  nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary'));
            filters_3[1] = new nlobjSearchFilter('internalid', null, 'anyOf',  nlapiGetFieldValue('custrecord_da_issue_mat_dep_department'));
            var searchresults_3 = nlapiSearchRecord('department', null, filters_3, null);

            if (searchresults_3 == null || searchresults_3.length < 0) {

                alert('Subsidiary not match,please choose another department');
                nlapiSetFieldValue('custrecord_da_issue_mat_dep_department', '');
            }}
    if (name == 'custrecord_da_issue_mat_dep_subsidiary' && nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary')!='' && nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary')!=null) {

          
            var subsidiary = nlapiGetFieldValue(name);

            
                   nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id',
				'custrecord_da_issue_mat_dep_lisubsidiary', subsidiary, true, true);
            
            

        }
if(type=='recmachcustrecord_da_issue_mat_dep_id'){
 if (name == 'custrecord_da_issue_mat_dep_qty' &&
           parseFloat(nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_qty')) != '' || name == 'custrecord_da_issue_mat_dep_unit_price' &&
            parseFloat(nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_unit_price')) != '' ) {


            var qty = parseFloat(nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_qty'));


            var price = parseFloat(nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_unit_price'));
var total=qty * price;
          if(total){
              nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id',
				'custrecord_da_issue_mat_dep_total', total, true, true);
            
            
            
          }else{
                 nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id',
				'custrecord_da_issue_mat_dep_total', 0, true, true);
          }
        }
 if (name == 'custrecord_da_issue_mat_dep_location' &&
           nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_location')  ||name == 'custrecord_da_issue_mat_item' &&
           nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_item') && nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_location') ) {
  var itemRec = nlapiLoadRecord('inventoryitem', nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_item'));

//find the line with location internal ID 1
var line = itemRec.findLineItemValue('locations','location',nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_location'));

var quantityonhand =0;
    
quantityonhand=itemRec.getLineItemValue('locations', 'quantityonhand', line);
    if (quantityonhand) {
            
               
              nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_qty_on_hand',quantityonhand,true,true);
            }else {
            
              nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_qty_on_hand',0,true,true);
            }
   
/* var columns_qty = new Array();
            columns_qty[0] = new nlobjSearchColumn('locationquantityonhand');
            var filters_qty = new Array();
            filters_qty[0] = new nlobjSearchFilter('internalid', null, 'anyOf', nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_item'));
            filters_qty[1] = new nlobjSearchFilter('inventorylocation', null, 'anyOf', nlapiGetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_dep_location'));
   

  
        
 
            var searchresults_qty = nlapiSearchRecord('item', null, filters_qty, columns_qty);

            if (searchresults_qty != null && searchresults_qty.length > 0) {
              var quantity_on_hand =0;
               quantity_on_hand = searchresults_qty[0].getValue('locationquantityonhand');
                  nlapiLogExecution('DEBUG', 'quantity_on_hand', quantity_on_hand);
              nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_qty_on_hand',quantity_on_hand);
            }
            else{
              nlapiSetCurrentLineItemValue('recmachcustrecord_da_issue_mat_dep_id','custrecord_da_issue_mat_qty_on_hand',0);
          
            }*/
   
   
   
 }
 }
    } catch (e) {
      
    }


}
	function validateline(type) {
    if (type == 'recmachcustrecord_da_issue_mat_dep_id') {
        try {


            if (parseFloat(nlapiGetCurrentLineItemValue(
                    type, 'custrecord_da_issue_mat_dep_qty')) > parseFloat(nlapiGetCurrentLineItemValue(
                    type, 'custrecord_da_issue_mat_qty_on_hand')) ) {
                nlapiSetCurrentLineItemValue(type, 'custrecord_da_issue_mat_dep_qty', 0);
                alert('QTY should not be greater than QTY on hand :'+''+parseFloat(nlapiGetCurrentLineItemValue(
                    type, 'custrecord_da_issue_mat_qty_on_hand')));
                return false;
            }


        } catch (e) {
            return false;
        }
    }
    return true;
}	
function clientLineInitrec(type) {
	try {
	if(type =='recmachcustrecord_da_issue_mat_dep_id'){
	

    
 
				 if(!nlapiGetCurrentLineItemValue(type,'custrecord_da_issue_mat_item')){
				var subsidiary=nlapiGetFieldValue('custrecord_da_issue_mat_dep_subsidiary');
				nlapiSetCurrentLineItemValue(type,'custrecord_da_issue_mat_dep_lisubsidiary', subsidiary);
                 }	

	}
		}catch(e){
}
      
	}
function SaveRecord() {

 
/*var ava_qty = parseInt(nlapiGetLineItemValue(
				'recmachcustrecord_da_issue_mat_dep_id',
				'custrecord_da_issue_mat_qty_on_hand', i));
		total_qty +=qty;
total_ava_qty +=ava_qty;
      alert(total_qty);
          alert(total_ava_qty);
		if (total_qty > total_ava_qty) {
			alert('Quantity  must be less than available quantity ');
			return false;

		}
	}*/
	return true;
  	 
}
