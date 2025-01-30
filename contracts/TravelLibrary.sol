// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library TravelLibrary {
    struct Trip {
        uint256 tripId;
        string name;
        string location;
        uint256 startDate;
        uint256 endDate;
        uint256 price;
        address provider;
        uint256 maxClients;
        uint256 currentClients;
        bool fundsWithdrawn;
    }

    event TripAdded(
        uint256 indexed tripId,
        string name,
        string location,
        uint256 startDate,
        uint256 endDate,
        uint256 price,
        address provider
    );
    event TripBooked(uint256 indexed tripId, address indexed client);
    event TripCancelled(uint256 indexed tripId, address indexed client);

    /**
     * @notice Adds a new trip to the list of trips.
     * @param trips The list of trips.
     * @param tripId The ID of the trip.
     * @param name The name of the trip.
     * @param location The location of the trip.
     * @param startDate The start date of the trip (timestamp).
     * @param endDate The end date of the trip (timestamp).
     * @param price The price of the trip in wei.
     * @param maxClients The maximum number of clients for the trip.
     */
    function addTripHandler(
        Trip[] storage trips,
        uint256 tripId,
        string memory name,
        string memory location,
        uint256 startDate,
        uint256 endDate,
        uint256 price,
        uint256 maxClients
    ) internal {
        trips.push(
            Trip({
                tripId: tripId,
                name: name,
                location: location,
                startDate: startDate,
                endDate: endDate,
                price: price,
                provider: msg.sender,
                maxClients: maxClients,
                currentClients: 0,
                fundsWithdrawn: false
            })
        );
        emit TripAdded(tripId, name, location, startDate, endDate, price, msg.sender);
    }

    /**
     * @notice Emits an event when a trip is booked.
     * @param tripId The ID of the trip.
     * @param client The address of the client.
     */
    function bookTripHandler(uint256 tripId, address client) internal {
        emit TripBooked(tripId, client);
    }

    /**
     * @notice Emits an event when a trip is cancelled.
     * @param tripId The ID of the trip.
     * @param client The address of the client.
     */
    function cancelTripHandler(uint256 tripId, address client) internal {
        emit TripCancelled(tripId, client);
    }

    /**
     * @notice Returns all trips.
     * @param trips The list of trips.
     * @return An array of all trips.
     */
    function getAllTrips(Trip[] storage trips) internal pure returns (Trip[] memory) {
        return trips;
    }

    /**
     * @notice Checks if a trip can be closed.
     * @param trip The trip to check.
     * @return True if the trip can be closed, false otherwise.
     */
    function canCloseTrip(Trip storage trip) internal view returns (bool) {
        return block.timestamp > trip.endDate && !trip.fundsWithdrawn;
    }
}
