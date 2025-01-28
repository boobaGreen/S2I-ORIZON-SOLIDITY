// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./TravelLibrary.sol";

contract TripManager {
    using TravelLibrary for TravelLibrary.Trip[];
    using TravelLibrary for TravelLibrary.Trip;

    mapping(address => uint256) public balancesCompanyHotel; // Company => Balance
    mapping(address => uint256) public balancesClients; // Client => Balance
    mapping(address => mapping(uint256 => bool)) public tripBookings; // Client => Trip ID => Is booked
    mapping(uint256 => address[]) public tripClientsList; // Trip ID => Clients

    TravelLibrary.Trip[] public trips;
    uint256 public nextTripId;

    constructor() {
        nextTripId = 0;
    }

    /**
     * @notice Adds a new trip to the system.
     * @param name The name of the trip.
     * @param location The location of the trip.
     * @param startDate The start date of the trip (timestamp).
     * @param endDate The end date of the trip (timestamp).
     * @param price The price of the trip in wei.
     * @param maxClients The maximum number of clients for the trip.
     */
    function addTrip(
        string memory name,
        string memory location,
        uint256 startDate,
        uint256 endDate,
        uint256 price,
        uint256 maxClients
    ) public {
        require(startDate > block.timestamp, "Start date must be in the future");
        require(endDate >= startDate, "End date must be after start date");

        trips.addTripHandler(nextTripId, name, location, startDate, endDate, price, maxClients);
        nextTripId++;
    }

    /**
     * @notice Books a trip for the caller.
     * @param tripId The ID of the trip to book.
     */
    function bookTrip(uint256 tripId) public payable {
        require(tripId < trips.length, "Trip does not exist");
        require(!tripBookings[msg.sender][tripId], "Trip is already purchased");
        TravelLibrary.Trip storage trip = trips[tripId];
        require(trip.currentClients < trip.maxClients, "Trip is fully booked");
        require(block.timestamp < trip.startDate - 1 days, "Trip is too close or already started");
        require(msg.value == trip.price, "Incorrect amount sent");

        // Lock the sent Ether in the balancesClients mapping
        balancesClients[msg.sender] += msg.value;
        tripBookings[msg.sender][tripId] = true;
        trip.currentClients++;
        tripClientsList[tripId].push(msg.sender);
        TravelLibrary.bookTripHandler(tripId, msg.sender);
    }

    /**
     * @notice Closes a trip and transfers the funds to the provider.
     * @param tripId The ID of the trip to close.
     */
    function closeTrip(uint256 tripId) public {
        require(tripId < trips.length, "Trip does not exist");
        TravelLibrary.Trip storage trip = trips[tripId];
        require(msg.sender == trip.provider, "Only the provider can close the trip");
        require(trip.canCloseTrip(), "Trip cannot be closed yet");

        address[] storage clients = tripClientsList[tripId];
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < clients.length; i++) {
            address client = clients[i];
            if (tripBookings[client][tripId]) {
                totalAmount += trip.price;
                balancesClients[client] -= trip.price;
                tripBookings[client][tripId] = false;
            }
        }

        balancesCompanyHotel[trip.provider] += totalAmount;
        trip.fundsWithdrawn = true;
    }

    /**
     * @notice Cancels a trip and refunds the client if within the allowed cancellation period.
     * @param tripId The ID of the trip to be canceled.
     */
    function cancelTrip(uint256 tripId) public {
        require(tripId < trips.length, "Trip does not exist");
        TravelLibrary.Trip storage trip = trips[tripId];
        require(balancesClients[msg.sender] >= trip.price, "Insufficient balance");
        require(block.timestamp < trip.startDate - 1 days, "Cancellation period has ended");

        // Refund the locked Ether to the client
        balancesClients[msg.sender] -= trip.price;
        payable(msg.sender).transfer(trip.price);

        // Reset the client's booking status for the trip
        tripBookings[msg.sender][tripId] = false;

        // Decrement the current number of clients
        trip.currentClients--;

        // Remove the client from the trip's client list
        address[] storage clients = tripClientsList[tripId];
        for (uint256 i = 0; i < clients.length; i++) {
            if (clients[i] == msg.sender) {
                clients[i] = clients[clients.length - 1];
                clients.pop();
                break;
            }
        }

        // Emit the TripCancelled event
        TravelLibrary.cancelTripHandler(tripId, msg.sender);
    }

    /**
     * @notice Withdraws the funds for the provider.
     */
    function withdrawFunds() public {
        uint256 amount = balancesCompanyHotel[msg.sender];
        require(amount > 0, "No funds to withdraw");

        // No reentrancy section
        balancesCompanyHotel[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @notice Gets the balance of a client.
     * @param client The address of the client.
     * @return The balance of the client in wei.
     */
    function getClientBalance(address client) public view returns (uint256) {
        return balancesClients[client];
    }

    /**
     * @notice Gets the balance of a provider.
     * @param provider The address of the provider.
     * @return The balance of the provider in wei.
     */
    function getProviderBalance(address provider) public view returns (uint256) {
        return balancesCompanyHotel[provider];
    }

    /**
     * @notice Gets all trips.
     * @return An array of all trips.
     */
    function getAllTrips() public view returns (TravelLibrary.Trip[] memory) {
        return trips.getAllTrips();
    }
}
