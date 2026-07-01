import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';

const searchForm = document.querySelector('.form-search');
const searchInput = document.querySelector('.form-input');
const gallery = document.querySelector('.gallery');
const loader = document.getElementById('loader');
const loadMore = document.getElementById('load-more');

const API_KEY = '56498857-093082d3f79dc0abc424cf2fd';
const BASE_URL = 'https://pixabay.com/api/';

let page = 1;

let searchImg = '';

const perPage = 20;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', async event => {
  event.preventDefault();

  const queryValue = searchInput.value.trim();

  page = 1;
  searchImg = queryValue;

  loadMore.classList.add('hidden');
  loadMore.classList.remove('is-active');

  if (!queryValue) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  gallery.innerHTML = '';
  loader.classList.remove('is-hidden');

  const axiosOptions = {
    params: {
      key: API_KEY,
      q: queryValue,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: perPage,
      page: page,
    },
  };

  try {
    const response = await axios.get(BASE_URL, axiosOptions);
    const data = response.data;

    loader.classList.add('is-hidden');
    searchForm.reset();

    if (data.hits.length === 0) {
      loadMore.classList.add('hidden');
      loadMore.classList.remove('is-active');
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    renderGallery(data.hits, true);

    if (data.totalHits <= page * perPage) {
      loadMore.classList.add('hidden');
      loadMore.classList.remove('is-active');
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    loader.classList.add('is-hidden');
    loadMore.classList.add('hidden');
    loadMore.classList.remove('is-active');
    searchForm.reset();
    iziToast.error({
      title: 'Error',
      message: `Bir sistem hatası oluştu: ${error.message}`,
      position: 'topRight',
    });
  }
});

loadMore.addEventListener('click', async () => {
  page += 1;

  loader.classList.remove('is-hidden');
  loadMore.classList.add('hidden');

  const axiosOptions = {
    params: {
      key: API_KEY,
      q: searchImg,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: perPage,
      page: page,
    },
  };

  try {
    const response = await axios.get(BASE_URL, axiosOptions);
    const data = response.data;
    loader.classList.add('is-hidden');

    renderGallery(data.hits, false);

    if (data.totalHits <= page * perPage) {
      loadMore.classList.add('hidden');
      loadMore.classList.remove('is-active');
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (error) {
    loader.classList.add('is-hidden');
    iziToast.error({
      title: 'Error',
      message: error.message,
      position: 'topRight',
    });
  }
});

function renderGallery(images, isFirstSearch) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
      <li class="card">
        <a class="card-link" href="${largeImageURL}">
          <img class="card-image" src="${webformatURL}" alt="${tags}" title="${tags}"/>
        </a>
        <ul class="card-stats">
          <li class="stat-item"><span class="stat-label">Likes</span><span class="stat-value">${likes}</span></li>
          <li class="stat-item"><span class="stat-label">Views</span><span class="stat-value">${views}</span></li>
          <li class="stat-item"><span class="stat-label">Comments</span><span class="stat-value">${comments}</span></li>
          <li class="stat-item"><span class="stat-label">Downloads</span><span class="stat-value">${downloads}</span></li>
        </ul>
      </li>
    `;
      }
    )
    .join('');

  if (isFirstSearch) {
    gallery.innerHTML = markup;
  } else {
    gallery.insertAdjacentHTML('beforeend', markup);

    const firstCard = gallery.querySelector('.card');
    if (firstCard) {
      const cardHeight = firstCard.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  }

  lightbox.refresh();
  loadMore.classList.remove('hidden');
  loadMore.classList.add('is-active');
}
