// LinkedList.ts

// Define a class for a node in the singly linked list
export class Node {
    marker: google.maps.Marker;
    next: Node | null;

    constructor(marker: google.maps.Marker) {
        this.marker = marker;
        this.next = null;
    }
}

// Define the singly linked list class
export class LinkedList {
    head: Node | null;

    constructor() {
        this.head = null;
    }

    // Method to add a marker to the linked list
    addMarker(marker: google.maps.Marker) {
        const newNode = new Node(marker);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
    }

    // Method to remove a marker from the linked list
    removeMarker(marker: google.maps.Marker) {
        if (!this.head) {
            return;
        }
        if (this.head.marker === marker) {
            this.head = this.head.next;
            return;
        }
        let current = this.head;
        while (current.next) {
            if (current.next.marker === marker) {
                current.next = current.next.next;
                return;
            }
            current = current.next;
        }
    }
}
