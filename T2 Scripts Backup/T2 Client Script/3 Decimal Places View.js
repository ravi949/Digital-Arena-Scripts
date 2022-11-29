formatDecimal(true);

function getSummaryValue(summary_3d) {
    var res = null;
    var summary_value = null;
    // custbody_da_subtotal_formattedValue custbody_da_subtotal_fs_lbl_uir_label

    ////console.log("Mostafa getSummaryValue: " + summary_3d);

    var summary_3d_lbl = summary_3d + "_fs_lbl_uir_label";
    var summary_3d_txt = summary_3d + "_formattedValue";

    var curr_elem = document.getElementById(summary_3d_lbl);
    var elem = null;
    if (curr_elem != null)
        elem = document.getElementById(summary_3d_lbl).parentElement;

    if (elem != null)
        summary_value = elem.getElementsByClassName("uir-field")[0].innerHTML.replace(/,/g, '');
    else {
        elem = document.getElementById(summary_3d_txt);
        if (elem != null)
            summary_value = elem.value;
    }

    if (summary_value != null && !isNaN(summary_value))
        res = ((parseFloat(summary_value) * 100) / 100).toFixed(3);
    return res;
}


function FormatElement(span_element) {

    var val = span_element.innerHTML;
    // //console.log("Mostafa FormatElement: " + val);

    if (val.indexOf('%') < 0) {
        val = val.replace(/,/g, '');
        var dc_value = (parseFloat(val) * 100) / 100;
        if (!isNaN(dc_value))
            span_element.innerHTML = dc_value.toFixed(3);

        // //console.log("Mostafa FormatElement dc_value: " + dc_value);
    }
}

function NLStringToNormalizedNumberString(val) {
    var new_val = val;
    if (val.indexOf('%') < 0) {
        // //console.log("New Mostafa Normalize: Not % = " + val);
        val = val.replace(/,/g, '');
        ////alert(val);
        var dc_value = (parseFloat(val) * 100) / 100;
        if (!isNaN(dc_value))
            new_val = dc_value.toFixed(3);
        else
            new_val = "";
    }

    // get the entered discount
    if (NLStringToNormalizedNumberString.caller.toString().includes("discountrate")) {
        var da_discountrate = document.getElementById('custbody_da_discount_rate');
        var chk = document.getElementById("custbody_da_is_percentage_discount_fs_inp");
        //console.log("Mostafa chk => " + chk);

        if (val.indexOf('%') > 0)
            chk.checked = true;
        else
            chk.checked = false;

        if (da_discountrate != null)
            da_discountrate.value = new_val;

        // console.log("Mostafa chk => " + chk.checked);
    }

    formatDecimal(false);

    return new_val;
}

function formatDecimal(is_first_time) {

    // //console.log("Mostafa formatDecimal() formatInputs() formatLabels()");

    var is_input_form = formatInputs(is_first_time);


    // //console.log("Mostafa is_input_form => " + is_input_form);

    formatLabels(is_input_form);
}

function formatInputs(is_first_time) {

    var is_input_form = false;
    var dc_value = 0;
    var input_value = "";
    var inputs = document.getElementsByTagName('input');
    var stored_discount = document.getElementById('custbody_da_discount_rate');
    console.log("Mostafa is_first_time  => " + is_first_time + " stored_discount = " + stored_discount);
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].hasAttribute("datatype")) {
            if (inputs[i].getAttribute("datatype") === "rate"
                && stored_discount != null
                && is_first_time == true
                &&
                (
                    inputs[i].getAttribute("id") != "discountrate_formattedValue"
                    ||
                    inputs[i].getAttribute("id") != "discountrate"
                )
            ) {
                console.log("Mostafa Yes  => " + stored_discount.value);
                inputs[i].value = stored_discount.value;
            }
            else if ((inputs[i].getAttribute("datatype") === "float"
                || inputs[i].getAttribute("datatype") === "currency")
                && inputs[i].value != ""
                && inputs[i].getAttribute("id") != "custbody_da_discount_rate"
                && inputs[i].getAttribute("id") != "discountrate_formattedValue"
                && inputs[i].getAttribute("id") != "discountrate") {
                is_input_form = true;
                input_value = inputs[i].value.replace(/,/g, '');
                if (!isNaN(input_value)) {
                    dc_value = (parseFloat(input_value) * 100) / 100;
                    //console.log("Mostafa Value dc_value " + dc_value);
                    inputs[i].value = dc_value.toFixed(3);
                }
            }
        }
    }

    return is_input_form;
}

function formatLabels(is_input_form) {
    var divs = document.getElementsByTagName('div');
    var summary_value = null;
    var span_element;
    for (var i = 0; i < divs.length; i += 1) {
        if (divs[i].hasAttribute("data-field-type")) {
            if (divs[i].getAttribute("data-field-type") === "float" ||
                divs[i].getAttribute("data-field-type") === "currency") {
                span_element = divs[i].getElementsByClassName("uir-field")[0];

                if (divs[i].firstChild != null && divs[i].firstChild.id == "subtotal_fs_lbl_uir_label") {
                    // subtotal summary
                    if (span_element != null) {
                        summary_value = getSummaryValue("custbody_da_subtotal");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "discounttotal_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // total discount summary
                        var summary_value = getSummaryValue("custbody_daheaderdiscountstored");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "taxtotal_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // total tax summary
                        summary_value = getSummaryValue("custbody_da_tax_stored_amount");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "total_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // total summary
                        summary_value = getSummaryValue("custbody_da_total_3_decimal");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "applied_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // total applied summary
                        summary_value = getSummaryValue("custbody_dabankstatementamount");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "amount_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // remaining amount summary
                        summary_value = getSummaryValue("custbody_da_total_3_decimal");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "totalbasecurrency_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // remaining amount summary
                        summary_value = getSummaryValue("custbody_da_total_3_decimal");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "reimbursable_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // remaining amount summary
                        summary_value = getSummaryValue("custbody_da_total_3_decimal");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (divs[i].firstChild != null && divs[i].firstChild.id == "amountremainingtotalbox_fs_lbl_uir_label") {
                    if (span_element != null) {
                        // remaining amount summary
                        summary_value = getSummaryValue("custbody_da_amount_due");
                        if (summary_value != null)
                            span_element.innerHTML = summary_value;
                    }
                }
                else if (!is_input_form)
                    FormatElement(span_element)
            }
        }
    }
}