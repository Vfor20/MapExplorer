import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, push, remove, child, Database, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCrENrHWsiRwgvEQc7hy8cVW6OmzxNJu78",
    authDomain: "mapexplorer-44fc1.firebaseapp.com",
    databaseURL: "https://mapexplorer-44fc1-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mapexplorer-44fc1",
    storageBucket: "mapexplorer-44fc1.appspot.com",
    messagingSenderId: "1008530366602",
    appId: "1:1008530366602:web:05414bc2ebb6bd0700cd73",
    measurementId: "G-H2CXQ7XRVS"
};


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\\

import {GridAlgorithm, MarkerClusterer} from "@googlemaps/markerclusterer";
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);


async function initMap() {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    const map = new Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 37.39094933041195, lng: -122.02503913145092 },
        zoom: 14,
        mapId: '4504f8b37365c3d0',
    });

    const infoWindow = new InfoWindow();

    let markerCount = 1;
    const markersArray: google.maps.Marker[] = [];

    let previousMarkerKey: string | null = null;

    map.addListener('click', (event) => {
        const existingMarkerIndex = markersArray.findIndex(marker =>
            marker.getPosition()?.equals(event.latLng)
        );

        if (existingMarkerIndex !== -1) {
            const existingMarker = markersArray[existingMarkerIndex];
            existingMarker.setMap(null);
            markersArray.splice(existingMarkerIndex, 1);
            markerCount--;
        } else {
            const newMarker = new google.maps.Marker({
                map,
                position: event.latLng,
                draggable: true,
                label: markerCount.toString() // Display only the number as the label
            });

            markerCount++;

            newMarker.addListener('contextmenu', () => {
                const position = newMarker.getPosition() as google.maps.LatLng;
                infoWindow.close();
                infoWindow.setContent(`Pin dropped at: ${position.lat()}, ${position.lng()}`);
                infoWindow.open(map, newMarker);
            });

            newMarker.addListener("click", () => {
                const markerIndex = markersArray.indexOf(newMarker);
                if (markerIndex !== -1) {
                    newMarker.setMap(null);
                    markersArray.splice(markerIndex, 1);
                    markerCount--;

                    const markerRef = ref(db, 'markers');
                    onValue(markerRef, (snapshot) => {
                        snapshot.forEach((childSnapshot) => {
                            const childData = childSnapshot.val();
                            if (childData.lat === newMarker.getPosition()?.lat() && childData.lng === newMarker.getPosition()?.lng()) {
                                const specificChildRef = child(markerRef, childSnapshot.key);
                                remove(specificChildRef);
                            }
                        });
                    });
                }
            });

            markersArray.push(newMarker);

            const newPosition = newMarker.getPosition();
            if (newPosition) {
                const timestamp = new Date().toLocaleString(); // current timestamp in human-readable format
                const markerRef = ref(db, 'markers');
                const markerData = {
                    lat: newPosition.lat(),
                    lng: newPosition.lng(),
                    timestamp: timestamp,
                    nextMarker: null // init next marker as null
                };
                const newMarkerKey = `Quest${markerCount - 1}`; // use "Quest" + number as the key
                const newMarkerRef = child(markerRef, newMarkerKey);
                set(newMarkerRef, markerData);

                if (previousMarkerKey !== null) {
                    const previousMarkerRef = child(markerRef, previousMarkerKey);
                    onValue(previousMarkerRef, (snapshot) => {
                        const previousMarkerData = snapshot.val();
                        set(previousMarkerRef, { ...previousMarkerData, nextMarker: newMarkerKey });
                    });
                }
                previousMarkerKey = newMarkerKey;
            }
        }
    });

    const markerCluster = new MarkerClusterer({ map, markers: markersArray });

    function hideMarkers(): void {
        markersArray.forEach(marker => marker.setMap(null));
    }

    function showMarkers(): void {
        markersArray.forEach(marker => marker.setMap(map));
    }

    function deleteMarkers(): void {
        hideMarkers();
        markersArray.length = 0;
    }

    document.getElementById("show-markers")!.addEventListener("click", showMarkers);
    document.getElementById("hide-markers")!.addEventListener("click", hideMarkers);
    document.getElementById("delete-markers")!.addEventListener("click", deleteMarkers);
}

initMap();
export {};

