async function createBook(bookData, imageFile) {
  const formData = new FormData();
  formData.append('book', JSON.stringify(bookData));

  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const response = await fetch('/api/books', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du livre');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans createBook :', error);
    throw error;
  }
}

export default createBook;