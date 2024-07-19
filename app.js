

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const authContainer = document.getElementById('auth-container');
  const notesContainer = document.getElementById('notes-container');
  const createNoteButton = document.getElementById('create-note');
  const searchInput = document.getElementById('search');
  const notesDiv = document.getElementById('notes');
  const TrashDiv = document.getElementById('trash');
  const archeiveDiv = document.getElementById('archeive');
  const logoutButton = document.getElementById('logout');
  const directLogin = document.getElementById('direct-login');
  const directRegister = document.getElementById('direct-register');
  const Trash = document.getElementById('view-trash');
  const note = document.getElementById('view-note');
  const archeive = document.getElementById('view-archived');
  const TrashNote = document.getElementById('trash-note');

  Trash.addEventListener('click', onTrashClick);
  note.addEventListener('click', onNoteClick);
  archeive.addEventListener('click', onArchieveClick);

  directLogin.addEventListener('click', onDirectLoginClick);
  directRegister.addEventListener('click', onDirectRegisterClick);

  registerForm.addEventListener('submit', onRegisterFormSubmit);
  loginForm.addEventListener('submit', onLoginFormSubmit);

  createNoteButton.addEventListener('click', onCreateNoteButtonClick);

  searchInput.addEventListener('input', onSearchInputChange);

  logoutButton.addEventListener('click', onLogoutButtonClick);

    note.style.border = '1px solid black'
    note.style.color='black'

  async function onTrashClick() {
    notesDiv.style.display = 'none';
    TrashDiv.style.display = 'flex';
    archeiveDiv.style.display = 'none'
    Trash.style.border = '1px solid black'
    Trash.style.color='black'
    note.style.border = 'none'
    note.style.color='white'
    archeive.style.border = 'none'
    archeive.style.color='white'
    TrashNote.style.display="flex"
    
    await getTrashItems();
  }

  async function onNoteClick() {
    notesDiv.style.display = 'flex';
    TrashDiv.style.display = 'none';
    archeiveDiv.style.display = 'none'
    note.style.border = '1px solid black'
    note.style.color='black'
    Trash.style.border = 'none'
    Trash.style.color='white'
    archeive.style.border = 'none'
    archeive.style.color='white'
    TrashNote.style.display="none"
    await fetchNotes();
  }

  async function onArchieveClick() {
    notesDiv.style.display = 'none';
    TrashDiv.style.display = 'none';
    archeiveDiv.style.display = 'flex'
    archeive.style.border = '1px solid black'
    archeive.style.color='black'
    note.style.border = 'none'
    note.style.color='white'
    Trash.style.border = 'none'
    Trash.style.color='white'
    TrashNote.style.display="none"
    await fetchArchieveItems();
  }

  function onDirectLoginClick() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
  }

  function onDirectRegisterClick() {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  }

  async function onRegisterFormSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('https://leeward-walnut-wavelength.glitch.me/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
      alert('Registration successful! Please log in.');
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
    } else {
      alert('Registration failed. Please try again.');
    }
  }

  async function onLoginFormSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('https://leeward-walnut-wavelength.glitch.me/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      alert('Login successful!');
      authContainer.style.display = 'none';
      notesContainer.style.display = 'flex';
      await fetchNotes();
    } else {
      alert('Login failed. Please try again.');
    }
  }

  async function onCreateNoteButtonClick() {
    const noteContent = window.prompt('Enter your note content:');
    if (noteContent !== null && noteContent.trim() !== '') {
      try {
        const response = await fetch('https://leeward-walnut-wavelength.glitch.me/addnotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: noteContent })
        });

        if (response.ok) {
          await fetchNotes(); // Fetch all notes including the new one
        } else {
          alert('Failed to add note. Please try again.');
        }
      } catch (error) {
        console.error('Error adding note:', error);
        alert('Failed to add note. Please try again later.');
      }
    } else if (noteContent !== null) {
      alert('Note content cannot be empty.');
    }
  }

  function onSearchInputChange() {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.note').forEach(note => {
      const content = note.textContent.toLowerCase();
      note.style.display = content.includes(query) ? '' : 'none';
    });
  }

  function onLogoutButtonClick() {
    authContainer.style.display = 'flex';
    authContainer.style.flexDirection = 'column';
    notesContainer.style.display = 'none';
    loginForm.style.display = 'flex';
    loginForm.style.flexDirection = 'column';
    registerForm.style.display = 'none';
  }

  async function getTrashItems() {
    try {
      const response = await fetch('https://leeward-walnut-wavelength.glitch.me/trash', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const notes = await response.json();
      notes.sort((a, b) => a.id - b.id);
      TrashDiv.innerHTML = '';
      if (notes.length === 0) {
        TrashDiv.innerHTML = '<p class="no-notes" style="text-align: center; padding-left:500px">No Trash notes yet!</p>';
      }
      // TrashDiv.innerHTML = 'Notes in Trash will automatically delete after 30 days';
      // TrashDiv.append(TrashDiv.innerHTML)

      notes.forEach(note => {

        const noteElement = createNoteElement(note, "trash");
        TrashDiv.appendChild(noteElement);
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Failed to fetch notes. Please try again later.');
    }
  }

  async function fetchNotes() {
    try {
      const response = await fetch('https://leeward-walnut-wavelength.glitch.me/notes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const notes = await response.json();
      notes.sort((a, b) => a.id - b.id);
      notesDiv.innerHTML = '';
      if (notes.length === 0) {
        notesDiv.innerHTML = '<p class="no-notes" style="text-align: center; padding-left:500px ">No notes yet!</p>';
      }
      notes.forEach(note => {
        
        const noteElement = createNoteElement(note, "note");
        notesDiv.appendChild(noteElement);
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Failed to fetch notes. Please try again later.');
    }
  }

  async function fetchArchieveItems() {
    try {
      const response = await fetch('https://leeward-walnut-wavelength.glitch.me/archeive', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const notes = await response.json();
      notes.sort((a, b) => a.id - b.id);
      archeiveDiv.innerHTML = '';
      if (notes.length === 0) {
        archeiveDiv.innerHTML = '<p class="no-notes" style="text-align: center; padding-left:500px">No Archeive notes yet!</p>';
      }
      notes.forEach(note => {
        const noteElement = createNoteElement(note, "archeive");
        archeiveDiv.appendChild(noteElement);
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert('Failed to fetch notes. Please try again later.');
    }
  }

  function createNoteElement(note, name) {
    const noteElement = document.createElement('div');
    noteElement.classList.add('note');
    noteElement.dataset.id = note.id;
    noteElement.style.backgroundColor = note.background
    if (note.imageurl) {
      const img = document.createElement('img');
      img.src = note.imageurl;
      img.alt = 'Note Image';
      
      // Set styles for the image (e.g., max width to ensure it fits within the note)
      img.style.maxWidth = '100%'; // Adjust as needed
      img.style.height = 'auto';   // Maintain aspect ratio
  
      // Append the image below the content area
      noteElement.appendChild(img);
    }
    // Create editable content area
    const contentArea = document.createElement('div');
    contentArea.contentEditable = true;
    contentArea.textContent = note.content;
    contentArea.style.minHeight = '200px'; // Example height

    // Apply styling to note element
    noteElement.style.width = '250px';
    noteElement.style.minHeight = '250px';
    noteElement.style.padding = '10px';
    noteElement.style.border = '1px solid #ccc';
    noteElement.style.borderRadius = '8px';
    noteElement.style.margin = '10px';

    noteElement.style.position = 'relative'; // Ensure positioning for icons
    noteElement.style.display = 'flex';
    noteElement.style.flexDirection = 'column';
    noteElement.style.justifyContent = 'space-between'; // Align icons at the bottom

    // Create delete icon
    const deleteIcon = document.createElement('svg');
    deleteIcon.classList.add('bi', 'bi-trash');
    deleteIcon.setAttribute('width', '1em');
    deleteIcon.setAttribute('height', '1em');
    deleteIcon.setAttribute('fill', 'currentColor');
    deleteIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    deleteIcon.setAttribute('viewBox', '0 0 16 16');
    deleteIcon.innerHTML = `
        <path d="M6.5 1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V3h-3V1.5zm4 .5v.01L10.01 3H5.99L6 1.01V1h4zM4.854 5H11.49l.473 8.769a.5.5 0 0 1-.49.517H4.872a.5.5 0 0 1-.49-.517L4.854 5z"/>
        <path fill-rule="evenodd" d="M3.5 5.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9z"/>
    `;
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.addEventListener('click', async () => {
      const confirmed = confirm(`Are you sure you want to delete this ${name}note?`);
      if (confirmed) {
        try {
          const id = parseInt(noteElement.dataset.id);
          const response = await fetch(`https://leeward-walnut-wavelength.glitch.me/deletenotesin${name}/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            noteElement.remove();
            if (name === "note"){
              fetchNotes();
            }else if (name === "trash"){
              getTrashItems();
            }else if(name === "archeive"){
              fetchArchieveItems();
            }
          } else {
            alert('Failed to delete note. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          alert('Failed to delete note. Please try again later.');
        }
      }
    });

    // Create archive icon
    
      const archiveIcon = document.createElement('svg');
      archiveIcon.classList.add('bi', 'bi-archive');
      archiveIcon.setAttribute('width', '1em');
      archiveIcon.setAttribute('height', '1em');
      archiveIcon.setAttribute('fill', 'currentColor');
      archiveIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      archiveIcon.setAttribute('viewBox', '0 0 16 16');
      archiveIcon.innerHTML = `
        <path d="M2 1.5a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5V3h-11V1.5zm2 2v9.465c0 .213.178.37.39.35l.11-.007h6c.213.018.39-.137.39-.35V3H4zm1 1.5h6V13H5V5.5z"/>
    `;
      archiveIcon.style.cursor = 'pointer';

      archiveIcon.addEventListener('click', async () => {
        const confirmed = confirm('Are you sure you want to archieve this note?');
        if (confirmed) {
          try {
            const id = parseInt(noteElement.dataset.id);
            const response = await fetch(`https://leeward-walnut-wavelength.glitch.me/archievenotes/${id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              noteElement.remove();
              fetchNotes()

            } else {
              alert('Failed to delete note. Please try again.');
            }
          } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note. Please try again later.');
          }
        }
      });
    
    // Create color palette icon
    const colorPaletteIcon = document.createElement('svg');
    colorPaletteIcon.classList.add('bi', 'bi-palette');
    colorPaletteIcon.setAttribute('width', '1em');
    colorPaletteIcon.setAttribute('height', '1em');
    colorPaletteIcon.setAttribute('fill', 'currentColor');
    colorPaletteIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    colorPaletteIcon.setAttribute('viewBox', '0 0 16 16');
    colorPaletteIcon.innerHTML = `
        <path fill-rule="evenodd" d="M2.5 1.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-3zm1 1v2h2V2.5h-2zm4 0v2h2V2.5h-2zm-4 3v2h2V5.5h-2zm4 0v2h2V5.5h-2zm-4 3v2h2V8.5h-2zm4 0v2h2V8.5h-2zm-4 3v2h2v-2h-2zm4 0v2h2v-2h-2z"/>
    `;
    colorPaletteIcon.style.cursor = 'pointer';
    // Create a new input element for color picking
    const colorPicker = document.createElement('input');
    colorPicker.setAttribute('type', 'color');
    colorPicker.setAttribute('id', 'colorPicker');
    colorPicker.setAttribute('name', 'colorPicker');
    colorPicker.style.display = 'none'; // Hide the color picker initially

    // Append the color picker input to the body or another container
    document.body.appendChild(colorPicker); // Adjust container as per your layout

    // Event listener for the colorPaletteIcon button click
    colorPaletteIcon.addEventListener('click', () => {
      // Display the color picker
      colorPicker.click(); // This opens the color picker dialog
    });

    // Event listener for when a color is picked
    colorPicker.addEventListener('input', async () => {

      const selectedColor = colorPicker.value; // Get the selected color
      const id = parseInt(noteElement.dataset.id);
      const response = await fetch(`https://leeward-walnut-wavelength.glitch.me/${name}background/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ background: selectedColor }),
      });


      if (name === "trash") {
        getTrashItems();
      } else if (name === "note") {
        fetchNotes();
      } else if (name === "archeive") {
        fetchArchieveItems();
      }



      // Apply the selected color to the note background (example)
      // const note = document.querySelector('.note'); // Adjust this selector as per your note's structure
      // note.style.backgroundColor = selectedColor;
    });




    // Create image upload icon
    const imageIcon = document.createElement('svg');
    imageIcon.classList.add('bi', 'bi-image');
    imageIcon.setAttribute('for', `imageInput_${note.id}`);
    imageIcon.setAttribute('width', '1em');
    imageIcon.setAttribute('height', '1em');
    imageIcon.setAttribute('fill', 'currentColor');
    imageIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    imageIcon.setAttribute('viewBox', '0 0 16 16');
    imageIcon.innerHTML = `
        <path fill-rule="evenodd" d="M3.5 1.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5V3h-11V1.5zm7.5 2.5a2 2 0 0 1 2 2v5.793l-2-2V5.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v3.293l-2 2V6a2 2 0 0 1 2-2h3zm1 .5H11a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h1a.5.5 0 0 1 .5.5v3.793l.646-.647a.5.5 0 0 1 .708 0l1.646 1.647V6a1 1 0 0 0-1-1z"/>
        <path d="M1.707 4.293a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0l1.793 1.793 5.793 5.793a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414 0L7 9.414l-5.293-5.293a1 1 0 0 1 0-1.414z"/>
    `;
    imageIcon.style.cursor = 'pointer';

   
    const fileInput = document.createElement('input');
    fileInput.setAttribute('id', `imageInput_${note.id}`);
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'image/*');
    fileInput.style.display = 'none'; // Hide input by default
    
    // Add event listener to image icon to trigger file input click
    imageIcon.addEventListener('click', () => {
        fileInput.click(); // Programmatically trigger the file input
    });
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
          try {
              const formData = new FormData();
              formData.append('image', file);
              formData.append('noteId', note.id);
  
              const response = await fetch('https://leeward-walnut-wavelength.glitch.me/uploadimage', {
                  method: 'PUT',
                  body: formData,
              });
  
              if (response.ok) {
                  const data = await response.json();
  
                  // Ensure imageUrl is defined and starts with 'data:image/'
                  const imageUrl = data.imageUrl;
                  if (imageUrl && imageUrl.startsWith('data:image/')) {
                      // Create an <img> element and set its src to the Base64 URL
                      const img = document.createElement('img');
                      img.src = imageUrl;
                      img.alt = 'Uploaded Image';
  
                      // Optionally set styles for the image
                      img.style.maxWidth = '100%'; // Example style
                      img.style.height = 'auto';   // Example style
  
                      // Clear any existing images or content (if needed)
                      const existingIconsContainer = noteElement.querySelector('.icons-container');
                     
                      noteElement.appendChild(img);

                     
                  } else {
                      alert('Invalid image URL received.');
                  }
              } else {
                  alert('Failed to upload image. Please try again.');
              }
          } catch (error) {
              console.error('Error uploading image:', error);
              alert('Failed to upload image. Please try again later.');
          }
      }
  });
  
    
    // Container for icons
    const iconsContainer = document.createElement('div');
    iconsContainer.style.display = 'flex';
    iconsContainer.style.justifyContent = 'space-around'; // Align icons to the right
    iconsContainer.style.marginTop = 'auto'; // Push icons to the bottom
    iconsContainer.appendChild(deleteIcon);
    if (name === "note"){
      iconsContainer.appendChild(archiveIcon);
    }
   
    iconsContainer.appendChild(colorPaletteIcon);
    if (name === "note"){
    iconsContainer.appendChild(imageIcon)
    }
    // Append content area and icons container to note element
    noteElement.appendChild(contentArea);
    noteElement.appendChild(iconsContainer);

    // Handle click to edit note content
    contentArea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        contentArea.blur(); // Lose focus to trigger update
      }
    });

    contentArea.addEventListener('blur', async () => {
      try {
        const updatedContent = contentArea.textContent;
        const id = parseInt(noteElement.dataset.id);
        const response = await fetch(`https://leeward-walnut-wavelength.glitch.me/update${name}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: updatedContent }),
        });

        if (response.ok) {
          // Update UI or handle success
        } else {
          alert('Failed to update note content. Please try again.');
        }
      } catch (error) {
        console.error('Error updating note content:', error);
        alert('Failed to update note content. Please try again later.');
      }
    });

    return noteElement;
  }


});
