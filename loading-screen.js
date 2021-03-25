function showLoader() {
    let loaderWrapper = document.createElement('div');
    loaderWrapper.id = 'loading';
    loaderWrapper.classList.add('loader-wrapper');

    let loader = document.createElement('div');
    loader.classList.add('loader');

    let loaderText = document.createElement('div');
    loaderText.classList.add('loader-text');
    loaderText.innerText = 'Loading Planes';

    loaderWrapper.appendChild(loader);
    loaderWrapper.appendChild(loaderText);
    document.body.appendChild(loaderWrapper);
}

function hideLoader() {
    let loader = document.querySelector('#loading');
    if (loader)
        loader.parentElement.removeChild(loader);
}