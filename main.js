import './style.css';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGE_SENDER_ID,
  appId: APP_ID,
};

const fbase = firebase.initializeApp(firebaseConfig);

const db = fbase.firestore();

let map;
let marker;
let locations = [];
const collection = db.collection('locations');

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 10, lng: -50 },
    zoom: 3,
    // mapTypeId: 'satellite',
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#242f3e' }],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
      },
    ],
  });

  getLocations();
  listenToCollection();
}

function listenToCollection() {
  let intervalId;
  let currentSeconds = 30;

  collection
    .orderBy('timestamp')
    .limitToLast(1)
    .onSnapshot(({ docs }) => {
      clearInterval(intervalId);
      currentSeconds = 30;

      intervalId = setInterval(() => {
        if (intervalId) {
          currentSeconds--;

          setTimer(currentSeconds);
        }
      }, 1000);

      const [doc] = docs;
      locations = [...locations, doc.data()];
      console.warn('Fetched new location!');

      console.table(doc.data());
      drawMarker(doc);
    });
}

function getLocations() {
  collection.get().then(({ docs }) => {
    locations = [...locations, ...docs.map((doc) => doc.data())];
    console.log(locations);
    docs.forEach((doc) => drawMarker(doc));
  });
}

function setTimer(sec) {
  const timer = document.getElementById('timer');

  timer.textContent = String(sec).length === 1 ? '0' + '' + sec : sec;
}

function drawMarker(doc) {
  const data = doc.data();
  const { timestamp } = data;
  const { latitude, longitude } = data.iss_position;

  const svgMarker = {
    path: 'M5.313 11.717a.29.29 0 0 0-.308.135 1.653 1.653 0 0 1-1.79.93 1.64 1.64 0 0 1 .932-1.788.29.29 0 0 0-.11-.535 3.03 3.03 0 0 0-2.837.98 5.046 5.046 0 0 0-.866 3.98.293.293 0 0 0 .24.24 6.347 6.347 0 0 0 1.006.08 4.336 4.336 0 0 0 3.29-1.25 3.067 3.067 0 0 0 .672-2.54.29.29 0 0 0-.23-.25zM15.866.135c-.114-.113-.348-.06-.348-.06A11.5 11.5 0 0 0 14.238 0a10.385 10.385 0 0 0-7.41 3 10.064 10.064 0 0 0-.68.76 3.847 3.847 0 0 0-2.972-.11C1.65 4.306.758 6.176.02 8.1a.29.29 0 0 0 .45.332 3.807 3.807 0 0 1 3.63-.5l-.362 1.31a.29.29 0 0 0 .125.32 12.82 12.82 0 0 1 2.577 2.574.29.29 0 0 0 .322.125l1.31-.36a3.752 3.752 0 0 1-.5 3.64.29.29 0 0 0 .333.45c1.923-.74 3.793-1.63 4.447-3.15a3.845 3.845 0 0 0-.108-2.97A9.844 9.844 0 0 0 13 9.18 10.508 10.508 0 0 0 15.93.49s.05-.235-.064-.35zM14.238.58a10.966 10.966 0 0 1 1.127.058 10.746 10.746 0 0 1 .047 1.55 1.828 1.828 0 0 1-1.083-.515A1.8 1.8 0 0 1 13.81.59c.14-.007.282-.012.424-.012zm-7 2.83A9.72 9.72 0 0 1 13.23.627a2.427 2.427 0 0 0 .5 1.237l-1.8 1.8a2.35 2.35 0 0 0-3.3 3.3l-2.1 2.1a12.862 12.862 0 0 0-1.752-1.422 9.627 9.627 0 0 1 2.46-4.232zm5.02 2.107a1.774 1.774 0 1 1-1.773-1.773 1.776 1.776 0 0 1 1.774 1.773zm-11.38 2C1.506 6.013 2.272 4.67 3.4 4.185a3.2 3.2 0 0 1 2.374.06A10.258 10.258 0 0 0 4.262 7.36a4.052 4.052 0 0 0-3.385.156zm5.932 4.13a14.353 14.353 0 0 0-2.457-2.453l.263-.956a12.413 12.413 0 0 1 3.15 3.147zm5.01.95c-.485 1.133-1.827 1.9-3.33 2.528a4.057 4.057 0 0 0 .15-3.385 10.29 10.29 0 0 0 3.122-1.52 3.205 3.205 0 0 1 .056 2.38zm-3.46-1.374A12.894 12.894 0 0 0 6.943 9.47l2.1-2.1a2.35 2.35 0 0 0 3.3-3.3l1.8-1.8a2.432 2.432 0 0 0 1.234.5 9.72 9.72 0 0 1-2.78 5.99 9.634 9.634 0 0 1-4.232 2.458z',
    fillColor: 'indianred',
    fillOpacity: 1,
    strokeWeight: 1,
    rotation: 0,
    scale: 2,
    anchor: new google.maps.Point(15, 30),
  };

  const date = new Date(timestamp * 1000);

  const marker = new google.maps.Marker({
    position: { lat: +latitude, lng: +longitude },
    title: `${date.toLocaleDateString('es-AR')} - ${date.toLocaleTimeString(
      'es-AR'
    )} (${date.toLocaleDateString('default', { weekday: 'long' })})`,
    icon: svgMarker,
    map: map,
  });

  marker.addListener('click', () => {
    map.setCenter(marker.getPosition());

    // console.log(
    //   `This location was tracked on ${new Date(
    //     timestamp * 1000
    //   ).toString()}`
    // );
  });
}

setTimeout(() => initMap(), 2000);
