// This is called when the <input> file upload changes.
function submitCoverFormOnChange() {
  var input = document.getElementById('album-cover-image');
  var file = input.files[0];
  submitCoverForm(file);
}

// This starts the logo animation and sends an async
// request to the backend.
function submitCoverForm(file) {
  //document.getElementById('cover-form').submit();
  document.getElementById('cover-form').style.display = "none";
  document.getElementById('vinyl').style.display = "block";

  var formData = new FormData();
  formData.append('file', file);

  jQuery.ajax({
    url: 'content',
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    type: 'POST',
    success: function(data){
      if (!data.error) {
        window.location.replace('content');
      } else {
        window.location.replace('error');
      }
    }
  });
}

// drag and drop feature
// source: https://css-tricks.com/drag-and-drop-file-uploading/
var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

var $form = $('#cover-form');

if (isAdvancedUpload) {
  $form.addClass('has-advanced-upload');
  $('.box__button').hide();
  $('.box__file').hide();
}

if (isAdvancedUpload) {

  var droppedFiles = false;

  $form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
  })
  .on('dragover dragenter', function() {
    $form.addClass('is-dragover');
  })
  .on('dragleave dragend drop', function() {
    $form.removeClass('is-dragover');
  })
  .on('drop', function(e) {
    droppedFiles = e.originalEvent.dataTransfer.files;
    console.log("DROP!");
    if (!droppedFiles[0]) {
      alert("Please drop an image file, not an image");
    } else {
      submitCoverForm(droppedFiles[0]);
    }
  });
}

$(document).ready(function(){
    $('.upload-samples').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        arrows: false,
        dots: false,
        pauseOnHover: false,
        responsive: [{
            breakpoint: 768,
            settings: {
                slidesToShow: 4
            }
        }, {
            breakpoint: 520,
            settings: {
                slidesToShow: 3
            }
        }]
    });
});