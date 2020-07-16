const percentComplete = document.getElementById('percent-complete');
const bytesSoFar = document.getElementById('bytes-uploaded');
const progressStatus = document.getElementById('progress-status');
const uploadBtn = document.getElementById('start-upload');
let filesList = [];
// map ldBar to LdBar to avoid constructor warning
const LdBar = ldBar;
const progressBar1 = new LdBar('#progress-1');


// in case there are multiple drop zones...
document.querySelectorAll('.drop-zone__input').forEach((inputElement) => {
  const dropZoneElement = inputElement.closest('.drop-zone');
  console.log(`drop zone el`, dropZoneElement);

  dropZoneElement.addEventListener('click', (e) => {
    inputElement.click();
  });

  dropZoneElement.addEventListener('change', (e) => {
    if (inputElement.files.length) {
      // TODO pick either input el files or e.target files, not both
      updateThumbnail(dropZoneElement, inputElement.files[0]);
      filesList = e.target.files;
      uploadBtn.style.display = 'block';
    }
  });

  dropZoneElement.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZoneElement.classList.add('drop-zone--over');
  });

  ['dragleave', 'dragend'].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove('drop-zone--over');
    });
  });

  dropZoneElement.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log(`drop event`, e.dataTransfer.files);
    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      console.log(`input el files`, inputElement.files);
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove('drop-zone--over');
  });
});

uploadBtn.addEventListener('click', (e) => {
  // TODO for now, just sending first file - needs loop unless tus can take a list
  // TODO check for filesList.length first
  upload(filesList[0]);
});

/**
 * adds a thumbnail for a file that is queued for upload
 * @param {Element} dropZoneElement the html element for the drop area.
 * @param {file} file the file to be used as the thumbnail.
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');
  if (dropZoneElement.querySelector('.drop-zone__prompt')) {
    // remove the prompt if this is the first drop
    dropZoneElement.querySelector('.drop-zone__prompt').remove();
  }
  if (!thumbnailElement) {
    thumbnailElement = document.createElement('div');
    thumbnailElement.classList.add('drop-zone__thumb');
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}
/**
 * upload the given file
 * @param {file} file the file to be uploaded.
 */
function upload(file) {
  // TODO - call this instead of the change eventlistener below

  console.log(`called file upload`);

  // get the selected file from the input element
  // const file = e.target.files[0]
  console.log(`stuff i know about file:`, file);

  // create a new tus upload
  const upload = new tus.Upload(file, {
    // endpoint is the upload creation URL from the tusd server
    // endpoint: 'http://localhost:1080/files/',
    // endpoint: 'http://tus-upload-demo.s3-website-us-east-1.amazonaws.com',
    endpoint: 'http://tus-upload-demo.s3-website-us-east-1.amazonaws.com',


    // Retry delays will enable tus-js-client to automatically retry on errors
    retryDelays: [0, 3000, 5000, 10000, 20000],
    // Attach additional meta data about the file for the server
    metadata: {
      filename: file.name,
      filetype: file.type,
    },
    // callback for errors which cannot be fixed using retries
    onError: (error) => {
      console.log('Failed because: ' + error);
    },
    // callback for reporting upload progress
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      percentComplete.innerHTML = percentage + '%';
      bytesSoFar.innerHTML = bytesUploaded + ' of ' + bytesUploaded;
      progressStatus.innerHTML = 'Upload in Progress';

      // TODO update a dom progress bar with percentage
      progressBar1.set(percentage);

      console.log(bytesUploaded, bytesTotal, percentage + '%');
    },
    // callback for once the upload is completed
    onSuccess: () => {
      console.log(`upload object:`, upload);
      console.log('downloaded %s from %s', upload.file.name, upload.url);
      progressStatus.innerHTML = 'Upload Complete';
      // TODO remove upload button
      uploadBtn.style.display = 'none';
    },
  });

  // start the upload
  upload.start();
}
