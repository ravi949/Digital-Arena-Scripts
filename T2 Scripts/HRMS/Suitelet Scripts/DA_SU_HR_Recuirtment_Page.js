function Registered_Vacancies(request, response) {
    var html = '';
    html += '<!DOCTYPE html>';
    html += '<html lang="en" xmlns="http://www.w3.org/1999/xhtml">';
    html += '<head>';
    html += ' <meta charset="utf-8" />';
    html += ' <meta name="viewport" content="width=device-width, initial-scale=1.0">';
    html += '<title></title>';
    html += '<script>function getUrlParameter(name) {var queryString = location.search;var urlParams = new URLSearchParams(location.search);return urlParams.get(name);}</script>';
    html += '<style>';
    html += ' @media only screen and (max-width: 768px) { [class*="col-"] { width: 100%; } }';
    html += ' .label {color: black; padding: 8px; font-family: Arial; font-size:12px; font-weight:bold;}';
    html += ' .info {background-color: #f2f2f2;} ';
    html += ' .desc {font-weight:bolder; font-size:14px; background-color: #f2f2f2;} ';
    html += ' input[type=text], select {width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;}';
    html += ' input[type=submit] { width: 100%; background-color: #4CAF50; color: white; padding: 14px 20px; margin: 8px 0; border: none; border-radius: 4px; cursor: pointer;}';
    html += ' input, select { width: 100%; padding: 12px 20px; margin: 8px 0; display: inline-block; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;}';
    html += ' input[type=submit]:hover { background-color: #45a049;}';
    html += ' .div_class { border-radius: 5px; background-color: #f2f2f2; padding: 20px;}';
    html += ' .table_fields{margin:auto; width:80%;}'
    html += '</style> ';
    html += '</head>';
    html += '';
    html += '<body style="max-width:90%">';
    html += '<div class="div_class">';
    html += ' <span class="label desc">Job Description : </span>';
    html += ' <span id="job_desc" name="job_desc" class="label desc"> </span>';
    html += '</div>';
    html += '<hr />';
    html += '<div class="div_class">';
    html += ' <span class="label info"> Name </span><span class="label info" style="color:crimson">*</span>';
    html += ' <input type="text" placeholder="Full Name" id="requester_name" name="requester_name" required />';
    html += ' <span class="label info"> DOB </span><span class="label info" style="color:crimson">*</span>';
    html += ' <input type="date" id="requester_dob"  pattern="\d{4}-\d{2}-\d{2}" name="requester_dob" required />';
    html += ' <span class="label info"> Email </span><span class="label info" style="color:crimson">*</span>';
    html += ' <input type="email" placeholder="Email" id="requester_email" name="requester_email" required />';
    html += ' <span class="label info"> Mobile </span><span class="label info" style="color:crimson">*</span>';
    html += ' <input type="tel" id="requester_mobile" name="requester_mobile" required />';
    html += ' <span class="label info"> Nationality</span><span class="label info" style="color:crimson">*</span>';
    html += ' <select name="requester_nationality" id="requester_nationality" required>';
    html += '         <option value="Afghanistan">Afghanistan</option>    ';
    html += '         <option value="Albania">Albania</option>    ';
    html += '         <option value="Algeria">Algeria</option>    ';
    html += '         <option value="American Samoa">American Samoa</option>  ';
    html += '         <option value="Andorra">Andorra</option>    ';
    html += '         <option value="Angola">Angola</option>  ';
    html += '         <option value="Anguilla">Anguilla</option>  ';
    html += '         <option value="Antarctica">Antarctica</option>  ';
    html += '         <option value="Antigua and Barbuda">Antigua and Barbuda</option>    ';
    html += '         <option value="Argentina">Argentina</option>    ';
    html += '         <option value="Armenia">Armenia</option>    ';
    html += '         <option value="Aruba">Aruba</option>    ';
    html += '         <option value="Australia">Australia</option>    ';
    html += '         <option value="Austria">Austria</option>    ';
    html += '         <option value="Azerbaijan">Azerbaijan</option>  ';
    html += '         <option value="Bahamas">Bahamas</option>    ';
    html += '         <option value="Bahrain">Bahrain</option>    ';
    html += '         <option value="Bangladesh">Bangladesh</option>  ';
    html += '         <option value="Barbados">Barbados</option>  ';
    html += '         <option value="Bedoon">Bedoon</option>  ';
    html += '         <option value="Belarus">Belarus</option>    ';
    html += '         <option value="Belgium">Belgium</option>    ';
    html += '         <option value="Belize">Belize</option>  ';
    html += '         <option value="Benin">Benin</option>    ';
    html += '         <option value="Bermuda">Bermuda</option>    ';
    html += '         <option value="Bhutan">Bhutan</option>  ';
    html += '         <option value="Bolivia">Bolivia</option>    ';
    html += '         <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>  ';
    html += '         <option value="Botswana">Botswana</option>  ';
    html += '         <option value="Brazil">Brazil</option>  ';
    html += '         <option value="British">British</option>    ';
    html += '         <option value="Brunei Darussalam">Brunei Darussalam</option>    ';
    html += '         <option value="Bulgaria">Bulgaria</option>  ';
    html += '         <option value="Burkina Faso">Burkina Faso</option>  ';
    html += '         <option value="Burundi">Burundi</option>    ';
    html += '         <option value="Cambodia">Cambodia</option>  ';
    html += '         <option value="Cameroon">Cameroon</option>  ';
    html += '         <option value="Canada">Canada</option>  ';
    html += '         <option value="Cape Verde">Cape Verde</option>  ';
    html += '         <option value="Central African Republic">Central African Republic</option>  ';
    html += '         <option value="Chad">Chad</option>  ';
    html += '         <option value="Chile">Chile</option>    ';
    html += '         <option value="China">China</option>    ';
    html += '         <option value="Colombia">Colombia</option>  ';
    html += '         <option value="Comoros">Comoros</option>    ';
    html += '         <option value="Congo, Republic of (Brazzaville)">Congo, Republic of (Brazzaville)</option>  ';
    html += '         <option value="Cook Islands">Cook Islands</option>  ';
    html += '         <option value="Costa Rica">Costa Rica</option>  ';
    html += '         <option value="Cote d???Ivoire">Cote d???Ivoire</option>    ';
    html += '         <option value="Croatia">Croatia</option>    ';
    html += '         <option value="Cuba">Cuba</option>  ';
    html += '         <option value="Cyprus">Cyprus</option>  ';
    html += '         <option value="Czech Republic">Czech Republic</option>  ';
    html += '         <option value="Democratic Republic">Democratic Republic</option>    ';
    html += '         <option value="Denmark">Denmark</option>    ';
    html += '         <option value="Djibouti">Djibouti</option>  ';
    html += '         <option value="Dominica">Dominica</option>  ';
    html += '         <option value="Dominican Republic">Dominican Republic</option>  ';
    html += '         <option value="East Timor Timor-Leste">East Timor Timor-Leste</option>  ';
    html += '         <option value="Ecuador">Ecuador</option>    ';
    html += '         <option value="Egypt">Egypt</option>    ';
    html += '         <option value="El Salvador">El Salvador</option>    ';
    html += '         <option value="Equatorial Guinea">Equatorial Guinea</option>    ';
    html += '         <option value="Eritrea">Eritrea</option>    ';
    html += '         <option value="Estonia">Estonia</option>    ';
    html += '         <option value="Ethiopia">Ethiopia</option>  ';
    html += '         <option value="Faroe Islands">Faroe Islands</option>    ';
    html += '         <option value="Fiji">Fiji</option>  ';
    html += '         <option value="Finland">Finland</option>    ';
    html += '         <option value="France">France</option>  ';
    html += '         <option value="French Guiana">French Guiana</option>    ';
    html += '         <option value="French Polynesia">French Polynesia</option>  ';
    html += '         <option value="Gabon">Gabon</option>    ';
    html += '         <option value="Gambia">Gambia</option>  ';
    html += '         <option value="Georgia">Georgia</option>    ';
    html += '         <option value="Germany">Germany</option>    ';
    html += '         <option value="Ghana">Ghana</option>    ';
    html += '         <option value="Gibraltar">Gibraltar</option>    ';
    html += '         <option value="Greece">Greece</option>  ';
    html += '         <option value="Greenland">Greenland</option>    ';
    html += '         <option value="Grenada">Grenada</option>    ';
    html += '         <option value="Guadeloupe">Guadeloupe</option>  ';
    html += '         <option value="Guam">Guam</option>  ';
    html += '         <option value="Guatemala">Guatemala</option>    ';
    html += '         <option value="Guinea">Guinea</option>  ';
    html += '         <option value="Guinea-Bissau">Guinea-Bissau</option>    ';
    html += '         <option value="Guyana">Guyana</option>  ';
    html += '         <option value="Haiti">Haiti</option>    ';
    html += '         <option value="Honduras">Honduras</option>  ';
    html += '         <option value="Hong Kong">Hong Kong</option>    ';
    html += '         <option value="Hungary">Hungary</option>    ';
    html += '         <option value="Iceland">Iceland</option>    ';
    html += '         <option value="India">India</option>    ';
    html += '         <option value="Indonesia">Indonesia</option>    ';
    html += '         <option value="Iran">Iran</option>  ';
    html += '         <option value="Iraq">Iraq</option>  ';
    html += '         <option value="Ireland">Ireland</option>    ';
    html += '         <option value="Italy">Italy</option>    ';
    html += '         <option value="Jamaica">Jamaica</option>    ';
    html += '         <option value="Japan">Japan</option>    ';
    html += '         <option value="Jordan">Jordan</option>  ';
    html += '         <option value="Kazakhstan">Kazakhstan</option>  ';
    html += '         <option value="Kenya">Kenya</option>    ';
    html += '         <option value="Kiribati">Kiribati</option>  ';
    html += '         <option value="Korea, (North Korea)">Korea, (North Korea)</option>  ';
    html += '         <option value="Korea, (South Korea)">Korea, (South Korea)</option>  ';
    html += '         <option value="Kuwait">Kuwait</option>  ';
    html += '         <option value="Kyrgyzstan">Kyrgyzstan</option>  ';
    html += '         <option value="Lao, PDR">Lao, PDR</option>  ';
    html += '         <option value="Latvia">Latvia</option>  ';
    html += '         <option value="Lebanon">Lebanon</option>    ';
    html += '         <option value="Lesotho">Lesotho</option>    ';
    html += '         <option value="Liberia">Liberia</option>    ';
    html += '         <option value="Libya">Libya</option>    ';
    html += '         <option value="Liechtenstein">Liechtenstein</option>    ';
    html += '         <option value="Lithuania">Lithuania</option>    ';
    html += '         <option value="Luxembourg">Luxembourg</option>  ';
    html += '         <option value="Macao">Macao</option>    ';
    html += '         <option value="Macedonia, Rep. of">Macedonia, Rep. of</option>  ';
    html += '         <option value="Madagascar">Madagascar</option>  ';
    html += '         <option value="Malawi">Malawi</option>  ';
    html += '         <option value="Malaysia">Malaysia</option>  ';
    html += '         <option value="Maldives">Maldives</option>  ';
    html += '         <option value="Mali">Mali</option>  ';
    html += '         <option value="Malta">Malta</option>    ';
    html += '         <option value="Marshall Islands">Marshall Islands</option>  ';
    html += '         <option value="Martinique">Martinique</option>  ';
    html += '         <option value="Mauritania">Mauritania</option>  ';
    html += '         <option value="Mauritius">Mauritius</option>    ';
    html += '         <option value="Mexico">Mexico</option>  ';
    html += '         <option value="Micronesia">Micronesia</option>  ';
    html += '         <option value="Moldova">Moldova</option>    ';
    html += '         <option value="Monaco">Monaco</option>  ';
    html += '         <option value="Mongolia">Mongolia</option>  ';
    html += '         <option value="Montenegro">Montenegro</option>  ';
    html += '         <option value="Montserrat">Montserrat</option>  ';
    html += '         <option value="Morocco">Morocco</option>    ';
    html += '         <option value="Mozambique">Mozambique</option>  ';
    html += '         <option value="Myanmar, Burma">Myanmar, Burma</option>  ';
    html += '         <option value="Namibia">Namibia</option>    ';
    html += '         <option value="Nauru">Nauru</option>    ';
    html += '         <option value="Nepal">Nepal</option>    ';
    html += '         <option value="Netherlands">Netherlands</option>    ';
    html += '         <option value="Netherlands Antilles">Netherlands Antilles</option>  ';
    html += '         <option value="New Caledonia">New Caledonia</option>    ';
    html += '         <option value="New Zealand">New Zealand</option>    ';
    html += '         <option value="Nicaragua">Nicaragua</option>    ';
    html += '         <option value="Niger">Niger</option>    ';
    html += '         <option value="Nigeria">Nigeria</option>    ';
    html += '         <option value="Niue">Niue</option>  ';
    html += '         <option value="Northern Mariana Islands">Northern Mariana Islands</option>  ';
    html += '         <option value="Norway">Norway</option>  ';
    html += '         <option value="Oman">Oman</option>  ';
    html += '         <option value="Pakistan">Pakistan</option>  ';
    html += '         <option value="Palau">Palau</option>    ';
    html += '         <option value="Palestine">Palestine</option>    ';
    html += '         <option value="Panama">Panama</option>  ';
    html += '         <option value="Papua New Guinea">Papua New Guinea</option>  ';
    html += '         <option value="Paraguay">Paraguay</option>  ';
    html += '         <option value="Peru">Peru</option>  ';
    html += '         <option value="Philippines">Philippines</option>    ';
    html += '         <option value="Poland">Poland</option>  ';
    html += '         <option value="Portugal">Portugal</option>  ';
    html += '         <option value="Puerto Rico">Puerto Rico</option>    ';
    html += '         <option value="Qatar">Qatar</option>    ';
    html += '         <option value="Reunion Island">Reunion Island</option>  ';
    html += '         <option value="Romania">Romania</option>    ';
    html += '         <option value="Russia">Russia</option>  ';
    html += '         <option value="Rwanda">Rwanda</option>  ';
    html += '         <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>    ';
    html += '         <option value="Saint Lucia">Saint Lucia</option>    ';
    html += '         <option value="Saint Vincent and the">Saint Vincent and the</option>    ';
    html += '         <option value="Samoa">Samoa</option>    ';
    html += '         <option value="San Marino">San Marino</option>  ';
    html += '         <option value="Sao Tome and Pr??ncipe">Sao Tome and Pr??ncipe</option>    ';
    html += '         <option value="Saudi Arabia">Saudi Arabia</option>  ';
    html += '         <option value="Senegal">Senegal</option>    ';
    html += '         <option value="Serbia">Serbia</option>  ';
    html += '         <option value="Seychelles">Seychelles</option>  ';
    html += '         <option value="Sierra Leone">Sierra Leone</option>  ';
    html += '         <option value="Singapore">Singapore</option>    ';
    html += '         <option value="Slovakia">Slovakia</option>  ';
    html += '         <option value="Slovenia">Slovenia</option>  ';
    html += '         <option value="Solomon Islands">Solomon Islands</option>    ';
    html += '         <option value="Somalia">Somalia</option>    ';
    html += '         <option value="South Africa">South Africa</option>  ';
    html += '         <option value="Spain">Spain</option>    ';
    html += '         <option value="Sri Lanka">Sri Lanka</option>    ';
    html += '         <option value="Sudan">Sudan</option>    ';
    html += '         <option value="Suriname">Suriname</option>  ';
    html += '         <option value="Swaziland">Swaziland</option>    ';
    html += '         <option value="Sweden">Sweden</option>  ';
    html += '         <option value="Switzerland">Switzerland</option>    ';
    html += '         <option value="Syria">Syria</option>    ';
    html += '         <option value="Taiwan">Taiwan</option>  ';
    html += '         <option value="Tajikistan">Tajikistan</option>  ';
    html += '         <option value="Tanzania">Tanzania</option>  ';
    html += '         <option value="Thailand">Thailand</option>  ';
    html += '         <option value="Tibet">Tibet</option>    ';
    html += '         <option value="Timor-Leste (East Timor)">Timor-Leste (East Timor)</option>  ';
    html += '         <option value="Togo">Togo</option>  ';
    html += '         <option value="Tonga">Tonga</option>    ';
    html += '         <option value="Trinidad and Tobago">Trinidad and Tobago</option>    ';
    html += '         <option value="Tunisia">Tunisia</option>    ';
    html += '         <option value="Turkey">Turkey</option>  ';
    html += '         <option value="Turkmenistan">Turkmenistan</option>  ';
    html += '         <option value="Tuvalu">Tuvalu</option>  ';
    html += '         <option value="Uganda">Uganda</option>  ';
    html += '         <option value="Ukraine">Ukraine</option>    ';
    html += '         <option value="United Arab Emirates">United Arab Emirates</option>  ';
    html += '         <option value="United Kingdom">United Kingdom</option>  ';
    html += '         <option value="United States">United States</option>    ';
    html += '         <option value="Uruguay">Uruguay</option>    ';
    html += '         <option value="Uzbekistan">Uzbekistan</option>  ';
    html += '         <option value="Vanuatu">Vanuatu</option>    ';
    html += '         <option value="Vatican City State">Vatican City State</option>  ';
    html += '         <option value="Venezuela">Venezuela</option>    ';
    html += '         <option value="Vietnam">Vietnam</option>    ';
    html += '         <option value="Virgin Islands (British)">Virgin Islands (British)</option>  ';
    html += '         <option value="Virgin Islands (U.S.)">Virgin Islands (U.S.)</option>    ';
    html += '         <option value="Wallis and">Wallis and</option>  ';
    html += '         <option value="Western Sahara">Western Sahara</option>  ';
    html += '         <option value="Yemen">Yemen</option>    ';
    html += '         <option value="Zambia">Zambia</option>  ';
    html += '         <option value="Zimbabwe">Zimbabwe</option>  ';
    html += ' </select>';
    html += ' <span class="label info"> Gender </span><span class="label info" style="color:crimson">*</span>';
    html += ' <select name="requester_gender" id="requester_gender" required>';
    html += '     <option value="Male">Male</option>';
    html += '     <option value="Female">Female</option>';
    html += ' </select>';
    html += ' <span class="label info">Address </span><span class="label info" style="color:crimson">*</span>';
    html += ' <input type="text" name="requester_address" id="requester_address" required />';
    html += ' <span class="label info">CV</span><span class="label info" style="color:crimson">*</span>';
    html += ' <input type="file" id="attached_cv" name="attached_cv" required />';
    html += '</div>';
    html += '<hr />';
    html += '';
    html += '';
    html += '';
    var params = request.getAllParameters();
    var job_id = params['jobid'];
    var source_id = params['sourceid'];
    var questions_count = 0;
    if (request.getMethod() == 'GET') {
        html += '    <script>';
        html += '         document.getElementById(\'custpage_job_id\').value = getUrlParameter(\'jobid\');';
        html += '         document.getElementById(\'custpage_source_id\').value = getUrlParameter(\'sourceid\');';
        html += '     </script> ';
        if (job_id) {
            var rec_ava_job = nlapiLoadRecord('customrecord_da_rec_create_vacancies', job_id);
            html += '    <script>';
            html += '       var span_desc;'
            html += '         span_desc = document.getElementById(\'job_desc\');';
            html += '           span_desc.textContent  = \'' + rec_ava_job.getFieldValue('name') + '\';';
            html += '     </script> ';
            var cuurent_questions_str = rec_ava_job.getFieldValue('custrecord_da_question_vacancy_select');
            var questions = cuurent_questions_str.split('\u0005');
            questions_count = questions.length;
           nlapiLogExecution('DEBUG','questions_count', questions_count);
            html += '<div class ="div_class">'
            for (var i = 0; i < questions.length; i++) {
                var question_record = nlapiLoadRecord('customrecord_da_question_create', questions[i]);
                html += '<span class="label info" id="question_id_"' + i + '" name="question_id_"' + i + '">' + question_record.getFieldValue('name') + '</span> ';
                html += ' <select id="answer_id_' + i + '" name = "answer_id_' + i + '" >';
                var columns = new Array();
                columns[0] = new nlobjSearchColumn('internalid');
                columns[1] = new nlobjSearchColumn('custrecord_da_answer_per_ques');
                var filters = new Array();
                filters[0] = new nlobjSearchFilter('custrecord_da_question_link', null, 'anyof', questions[i]);
                var searchresults = nlapiSearchRecord('customrecord_da_question_answer', null, filters, columns);
                for (var j = 0; j < searchresults.length; j++) {
                    html += '<option selected="false" value = "' + searchresults[j].getValue('internalid') + '"> ' + searchresults[j].getValue('custrecord_da_answer_per_ques') + ' </option>';
                }
                html += ' </select>';
            }
          nlapiLogExecution('DEBUG','questions_count1', questions_count);
            html += ' <input type="submit" value="Submit" />';
            for (var j = 0; j < questions.length; j++) {
                html += '<input type="text" style="display:none;"  id="question_internal_id_' + j + '" name="question_internal_id_' + j + '" value="' + questions[j] + '" />';
            }
            html += '    <input type="date" style="display:none;"   id="ava_from" name="ava_from" />';
            html += '    <input type="date"  style="display:none;"  id="ava_to" name="ava_to" />';
            html += '    <input type="number" style="display:none;"   id="custpage_source_id" name="custpage_source_id"/>';
            html += '    <input type="number"  style="display:none;"    id="custpage_job_id" name="custpage_job_id" />';
            html += '    <input type="number"  style="display:none;"    id="custpage_questions_count" name="custpage_questions_count" />';
            html += '    <input type="checkbox"   style="display:none;"   id="is_ava_online" name="is_ava_online"  />';
            html += '    <script>';
            html += '         document.getElementById(\'custpage_job_id\').value = getUrlParameter(\'jobid\');';
            html += '         document.getElementById(\'custpage_source_id\').value = getUrlParameter(\'sourceid\');';
            html += '     </script> ';
            html += '    <script>';
            html += '         document.getElementById(\'custpage_questions_count\').value = "' + questions_count + '"';
            html += '     </script> ';
            html += ' </div> </form> ';
            var form = nlapiCreateForm('', false);
            var html_code_var = form.addField('custpage_html_page', 'inlinehtml');
            var fileField = form.addField('mycustomfile', 'file', 'Attach CV');
           // form.getField('mycustomfile').setDisplayType('hidden');
           html += '<script>document.getElementById(\'mycustomfile\').style.visibility = "hidden";</script>';
            html_code_var.defaultValue = html;
            response.writePage(form);
        }
    } else if (request.getMethod() == 'POST') {
        var rec = nlapiCreateRecord('customrecord_da_registered_candidate');
        rec.setFieldValue('custrecord_da_registerd_source', request.getParameter('custpage_source_id'));
        rec.setFieldValue('custrecord_da_registerd_vacanci', request.getParameter('custpage_job_id'));
       rec.setFieldValue('name', request.getParameter('requester_name'));
        rec.setFieldValue('custrecord_da_candidate_name_reg', request.getParameter('requester_name'));
      
      var date = request.getParameter('requester_dob');
      var day = date.split("-")[2];
      var month = date.split("-")[1];
      var year = date.split("-")[0];
       nlapiLogExecution('DEBUG','files', day+"m"+month+"y"+year);
         rec.setFieldValue('custrecord_da_dob_rig', new Date(month+"/" +day+"/"+year));
        //rec.setFieldValue('custrecord_da_dob_rig', '21/9/1990');
        rec.setFieldText('custrecord_da_registerd_nationality', request.getParameter('requester_nationality'));
        rec.setFieldValue('custrecord_da_registered_address', request.getParameter('requester_address'));
        rec.setFieldValue('custrecord_da_phone_number_reg', request.getParameter('requester_mobile'));
        rec.setFieldValue('custrecord_da_registerd_email', request.getParameter('requester_email'));
        rec.setFieldText('custrecord_da_gender_regis', request.getParameter('requester_gender'));
        rec.setFieldValue('custrecord_da_registered_date_new', nlapiDateToString(new Date()));
        // upload file
        var files = request.getFile("attached_cv");
     
        files.setFolder(343);
        var id = nlapiSubmitFile(files);
        rec.setFieldValue('custrecord_da_reg_candidate_cv', id);
       // rec.setFieldValue('custrecord_da_reg_vac_status', 1);
        var questions_count = request.getParameter('custpage_questions_count');
        // craete registered vacancy
        var reg_vac_id = nlapiSubmitRecord(rec);
        for (var i = 0; i < questions_count; i++) {
            var rec_assignment = nlapiCreateRecord('customrecord_da_candiate_job_profiles');
            // set register vacancy id
            rec_assignment.setFieldValue('custrecord_da_job_vancancy_ref', reg_vac_id);
            var question_internal_id = request.getParameter('question_internal_id_' + i);
            // set question id
            rec_assignment.setFieldValue('custrecord_da_can_job_question', question_internal_id);
            var answer_internal_id = request.getParameter('answer_id_' + i);
            // set answer id
            rec_assignment.setFieldValue('custrecord_da_can_job_profile_answer', answer_internal_id);
            nlapiSubmitRecord(rec_assignment);
        }
      
      var responseHtml = '<div class="header-custom email-signup-thankyou">   <div class="content">     <div class="left-hole"></div>     <div class="right-hole"></div>     <div class="main-content">       <h2>Thank You , Your Request has been Recieved </h2>  <p align ="left"></p>          </div>  <button type="submit"  onclick="return goHome()">Go To Home</button>  </div> </div><script>function goHome() {  window.open("https://google.com/");}</script>';
						var css = '@import url(//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css); .email-signup-thankyou{   font-family:sans-serif;   display: flex;   justify-content: center;   align-items: center;   color: #fff;   background: #333;   padding:10%;   .content{     margin: auto;   max-width:700px;     color:#333;     box-shadow: 0 3px 6px rgba(0,0,0,0.55), 0 3px 6px rgba(0,0,0,0.23);     background:url("https://i.giphy.com/media/U3qYN8S0j3bpK/giphy.webp") no-repeat #fff;     background-position: right 5px bottom 5px;     background-size: 10em;     text-align:center;     position: relative;     padding:10%;     border-radius:5px;     .left-hole,.right-hole{       position: absolute;       width:20px; height:20px;       background:#333;       border-radius:50%;       top:15px;     .left-hole{       left:15px;       top:10px;     .right-hole{       right:15px;       top:10px;     h2,h3{       text-align:left;       padding:5% 5% 0% 3%;       color:#333;       font-weight:900;     .main-content{       > h1 {         color:#333;         text-transform:uppercase;         margin-top:-2%;         font-size:2.5em;         font-weight:900;';
				var html = '<html>' + responseHtml + '<style>' + css + '</style></html>';
						response.write(html);
					
    }
}