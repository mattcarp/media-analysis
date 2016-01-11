// POC-only: never expose globals on the window object

var mediaInput = document.getElementsByTagName('input')[0];

mediaInput.onchange = function () {
  $('.format-section').hide();
  $('.streams-section').hide();
  $('.tags-section').hide();
  $('.file-info').hide();
  $('.errors').hide();
  readBlob();
};


// fill tables with analysis data
function populateTable(data) {
  'use strict';

  var tableContent = '';
  var formatTableContent = '';
  var tagTableContent = '';

  // ffmpeg returns malformed json - keys aren't double-quoted,
  // however we trust it enough to use .eval()
  var badJSON = data;
  var jsonObj = eval('(' + badJSON + ')');

  // ffprobe divides metadata into a 'streams' array and a 'format' object
  for (var i = 0;  i < jsonObj.streams.length; i++) {
    $.each(jsonObj.streams[i], function (k, v) {
    tableContent += '<tr>';
    tableContent += '<td class="col-sm-5"><b>' + k + '</b></td>';
    tableContent += '<td class="col-sm-7"> ' + v + '</td>';
    tableContent += '</tr>';

    });
    tableContent += '<tr><td>==========</td><td>==========</td></tr>';
  }


  $.each(jsonObj.format, function (k, v) {
    formatTableContent += '<tr>';
    formatTableContent += '<td class="col-sm-5"><b>' + k + '</b></td>';
    formatTableContent += '<td class="col-sm-7"> ' + v + '</td>';
    formatTableContent += '</tr>';
  });

  // not all formats have a tags key
  if (jsonObj.format.tags) {
    $.each(jsonObj.format.tags, function (k, v) {
      console.log('key: ' + k + ' - value: ' + v);
      tagTableContent += '<tr>';
      tagTableContent += '<td class="col-sm-5"><b>' + k + '</b></td>';
      tagTableContent += '<td class="col-sm-7"> ' + v + '</td>';
      formatTableContent += '</tr>';
    });
  }
  

  // Inject the content strings into the existing HTML tables
  $('.format-section').show();
  $('#format tbody').html(formatTableContent);
  if (jsonObj.format.tags) {      
    $('.tags-section').show();
    $('#tags tbody').html(tagTableContent);
  }
  $('.streams-section').show();
  $('#streams tbody').html(tableContent);
};

function readBlob() {
  var files = document.getElementById('files').files;

  if (!files.length) {
    alert('Please select a file!');
    return;
  }

  var file = files[0];

  $('.file-name').html(file.name);
  $('.file-size').html(file.size);
  if (file.lastModifiedDate) {
    $('.file-lastmod').html(file.lastModifiedDate);
  } else {
    $('.file-lastmod').html('at an undetermined time');
  }

  $('.file-info').show();
  var reader = new FileReader();

  // If we use onloadend, we need to check the readyState.
  reader.onloadend = function (evt) {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        
      $.ajax({
        type: "POST",
        url: "/analysis",
        data: blob,
        processData: false,
        // content type that we are sending
        contentType: 'application/octet-stream',
        // data type that we expect in return
        // dataType: "", 
        error: function (err) {
          console.log("you have an error:");
          console.log(err);
        },
        success: function (data) {          
          // error handling
          if (data === 'undefined' || data === '') {
            console.log('we have a problem, returned from ffprobe:');
            console.log(data);
            $('.error-message').html(data);
            $('.errors').show();
          } else {
            populateTable(data);
          }

        }
      });
    }
  };

  var blob = file.slice(0, 100000);
  reader.readAsBinaryString(blob);
}