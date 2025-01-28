// REFACTOR usasto sc
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  addDefaultTripToParis,
  addDefaultTripToBerlin,
  addDefaultTripToTokyo,
  addDefaultTripToNeyYork,
  addDefaultTripToRome,
  ONE_DAY,
} from "../scripts/utils";
import { reset, time } from "@nomicfoundation/hardhat-network-helpers";

describe("TripManager", function () {
  let tripManager: any;
  let provider: any;
  let client: any;
  let anotherClient: any;

  beforeEach(async function () {
    // reset necessario per riportare il time attuale all ora  attuale dopo aver usato evm_increaseTime"
    await reset();
    [provider, client, anotherClient] = await ethers.getSigners();
    const TripManagerFactory = await ethers.getContractFactory("TripManager");
    tripManager = await TripManagerFactory.deploy();
  });

  describe("Add Trip", function () {
    it("should add a new trip", async function () {
      await addDefaultTripToParis(tripManager, provider);

      const trips = await tripManager.getAllTrips();
      expect(trips.length).to.equal(1);
      expect(trips[0].name).to.equal("Trip to Paris");
      expect(trips[0].location).to.equal("Paris");
      expect(trips[0].price).to.equal(ethers.parseEther("1").toString());
      expect(trips[0].maxClients).to.equal(10);
    });
    it("should add a new trip", async function () {
      await addDefaultTripToParis(tripManager, provider);

      const trips = await tripManager.getAllTrips();
      expect(trips.length).to.equal(1);
      expect(trips[0].name).to.equal("Trip to Paris");
      expect(trips[0].location).to.equal("Paris");
      expect(trips[0].price).to.equal(ethers.parseEther("1").toString());
      expect(trips[0].maxClients).to.equal(10);
    });

    it("should add a trip with start date and end date two days apart", async function () {
      const startDate = Math.floor(Date.now() / 1000) + ONE_DAY;
      const endDate = startDate + ONE_DAY * 2; // Two days apart

      await tripManager.addTrip(
        "Trip with two days apart",
        "Nowhere",
        startDate,
        endDate,
        ethers.parseEther("1").toString(),
        10,
        { from: provider.address }
      );

      const trips = await tripManager.getAllTrips();
      expect(trips.length).to.equal(1);
      expect(trips[0].name).to.equal("Trip with two days apart");
      expect(trips[0].location).to.equal("Nowhere");
      expect(trips[0].startDate).to.equal(startDate);
      expect(trips[0].endDate).to.equal(endDate);
    });

    it("should add a trip with start date and end date three days apart", async function () {
      const startDate = Math.floor(Date.now() / 1000) + ONE_DAY;
      const endDate = startDate + ONE_DAY * 3; // Three days apart

      await tripManager.addTrip(
        "Trip with three days apart",
        "Nowhere",
        startDate,
        endDate,
        ethers.parseEther("1").toString(),
        10,
        { from: provider.address }
      );

      const trips = await tripManager.getAllTrips();
      expect(trips.length).to.equal(1);
      expect(trips[0].name).to.equal("Trip with three days apart");
      expect(trips[0].location).to.equal("Nowhere");
      expect(trips[0].startDate).to.equal(startDate);
      expect(trips[0].endDate).to.equal(endDate);
    });
  });

  describe("Book Trip", function () {
    it("should book a trip", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      const clientBalance = await tripManager.getClientBalance(client.address);
      expect(clientBalance).to.equal(ethers.parseEther("1").toString());
    });

    it("should revert if trip starts in less than a day", async function () {
      await tripManager.addTrip(
        "Trip to Rome",
        "Rome",
        Math.floor(Date.now() / 1000) + ONE_DAY / 24, // startDate: 1 hour from now
        Math.floor(Date.now() / 1000) + ONE_DAY * 4, // endDate: 4 day from now
        ethers.parseEther("1").toString(), // price: 1 ether
        10, // maxClients
        { from: provider.address }
      );

      await expect(
        tripManager
          .connect(client)
          .bookTrip(0, { value: ethers.parseEther("1").toString() })
      ).to.be.revertedWith("Trip is too close or already started");
    });

    it("should revert if trip has already started", async function () {
      await addDefaultTripToTokyo(tripManager, provider);
      // Simula il passaggio del tempo per rendere la cancellazione troppo a ridosso della partenza
      // await ethers.provider.send("evm_increaseTime", [86400 * 5]); // Aumenta il tempo di 5 giorni
      // advance time by one hour and mine a new block
      await time.increase(86400 * 5); // Aumenta il tempo di 5 giorni
      await expect(
        tripManager
          .connect(client)
          .bookTrip(0, { value: ethers.parseEther("1").toString() })
      ).to.be.revertedWith("Trip is too close or already started");
    });

    it("should revert if trip has already ended", async function () {
      await addDefaultTripToTokyo(tripManager, provider);
      // await ethers.provider.send("evm_increaseTime", [86400 * 20]); // Aumenta il tempo di 20 giorni
      // await ethers.provider.send("evm_mine", []); // Mina il prossimo blocco
      await time.increase(86400 * 20); // Aumenta il tempo di 20 giorni
      await expect(
        tripManager
          .connect(client)
          .bookTrip(0, { value: ethers.parseEther("1").toString() })
      ).to.be.revertedWith("Trip is too close or already started");
    });

    it("should revert if not enough funds to book the trip", async function () {
      await addDefaultTripToRome(tripManager, provider);

      await expect(
        tripManager
          .connect(client)
          .bookTrip(0, { value: ethers.parseEther("0.5").toString() })
      ).to.be.revertedWith("Incorrect amount sent");
    });

    it("should revert if trip is already booked", async function () {
      await addDefaultTripToRome(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      await expect(
        tripManager
          .connect(client)
          .bookTrip(0, { value: ethers.parseEther("1").toString() })
      ).to.be.revertedWith("Trip is already purchased");
    });

    it("should revert if trip is fully booked", async function () {
      await addDefaultTripToNeyYork(tripManager, provider);
      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      await expect(
        tripManager
          .connect(anotherClient)
          .bookTrip(0, { value: ethers.parseEther("1").toString() })
      ).to.be.revertedWith("Trip is fully booked");
    });

    it("should revert if trip does not exist", async function () {
      await expect(
        tripManager
          .connect(client)
          .bookTrip(999, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Trip does not exist");
    });
  });

  describe("Cancel Trip", function () {
    it("should cancel a trip within the allowed time", async function () {
      await addDefaultTripToRome(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1") });

      await tripManager.connect(client).cancelTrip(0);

      const clientBalance = await tripManager.getClientBalance(client.address);
      expect(clientBalance).to.equal(ethers.parseEther("0"));
    });

    it("should revert if trying to cancel a trip less than 1 day before start", async function () {
      await addDefaultTripToRome(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1") });

      // Simula il passaggio del tempo per rendere la cancellazione troppo a ridosso della partenza
      await ethers.provider.send("evm_increaseTime", [86400 * 1.5]); // Aumenta il tempo di 1.5 giorni
      await ethers.provider.send("evm_mine", []); // Mina il prossimo blocco

      await expect(
        tripManager.connect(client).cancelTrip(0)
      ).to.be.revertedWith("Cancellation period has ended");
    });

    it("should revert if trying to cancel a trip that has already started", async function () {
      await addDefaultTripToBerlin(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1") });

      // Simula il passaggio del tempo per rendere la cancellazione dopo la fpartenza del viaggio
      await ethers.provider.send("evm_increaseTime", [86400 * 10]); // Aumenta il tempo di 10 giorni
      await ethers.provider.send("evm_mine", []); // Mina il prossimo blocco

      await expect(
        tripManager.connect(client).cancelTrip(0)
      ).to.be.revertedWith("Cancellation period has ended");
    });

    it("should cancel a trip within the allowed time and update client balance", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1") });

      // Saldo del cliente prima della cancellazione
      const initialBalance = await ethers.provider.getBalance(client.address);

      // Cancella il viaggio entro il periodo consentito
      await tripManager.connect(client).cancelTrip(0);

      // Saldo del cliente dopo la cancellazione
      const finalBalance = await ethers.provider.getBalance(client.address);

      // Verifica che il saldo del cliente sia stato aggiornato correttamente
      expect(finalBalance).to.be.above(initialBalance);

      const clientContractBalance = await tripManager.getClientBalance(
        client.address
      );
      expect(clientContractBalance).to.equal(ethers.parseEther("0"));
    });
  });
  describe("Close Trip", function () {
    it("should close a trip and transfer funds to the provider", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      // Simula il passaggio del tempo per rendere il viaggio già terminato
      await time.increase(ONE_DAY * 4); // Aumenta il tempo di 4 giorni

      await tripManager.connect(provider).closeTrip(0);

      const providerBalance = await tripManager.getProviderBalance(
        provider.address
      );
      expect(providerBalance).to.equal(ethers.parseEther("1").toString());
    });

    it("should revert if trying to close a trip that has not ended yet", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      await expect(
        tripManager.connect(provider).closeTrip(0)
      ).to.be.revertedWith("Trip cannot be closed yet");
    });

    it("should revert if trying to close a trip by a non-provider", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      // Simula il passaggio del tempo per rendere il viaggio già terminato
      await time.increase(ONE_DAY * 4); // Aumenta il tempo di 4 giorni

      await expect(tripManager.connect(client).closeTrip(0)).to.be.revertedWith(
        "Only the provider can close the trip"
      );
    });

    it("should revert if trying to close a trip that does not exist", async function () {
      await expect(
        tripManager.connect(provider).closeTrip(999)
      ).to.be.revertedWith("Trip does not exist");
    });

    it("should revert if trying to close a trip that has already been closed", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      // Simula il passaggio del tempo per rendere il viaggio già terminato
      await time.increase(ONE_DAY * 4); // Aumenta il tempo di 4 giorni

      await tripManager.connect(provider).closeTrip(0);

      await expect(
        tripManager.connect(provider).closeTrip(0)
      ).to.be.revertedWith("Trip cannot be closed yet");
    });
  });
  it("should close a trip with multiple clients and transfer funds to the provider", async function () {
    await addDefaultTripToParis(tripManager, provider);

    await tripManager
      .connect(client)
      .bookTrip(0, { value: ethers.parseEther("1").toString() });
    await tripManager
      .connect(anotherClient)
      .bookTrip(0, { value: ethers.parseEther("1").toString() });

    // Simula il passaggio del tempo per rendere il viaggio già terminato
    await time.increase(ONE_DAY * 4); // Aumenta il tempo di 4 giorni

    await tripManager.connect(provider).closeTrip(0);

    const providerBalance = await tripManager.getProviderBalance(
      provider.address
    );
    expect(providerBalance).to.equal(ethers.parseEther("2").toString());
  });
  describe("Withdraw Funds", function () {
    it("should allow the provider to withdraw funds", async function () {
      await addDefaultTripToParis(tripManager, provider);

      await tripManager
        .connect(client)
        .bookTrip(0, { value: ethers.parseEther("1").toString() });

      // Simula il passaggio del tempo per rendere il viaggio già terminato
      await time.increase(ONE_DAY * 4); // Aumenta il tempo di 4 giorni

      await tripManager.connect(provider).closeTrip(0);

      const initialProviderBalance = await ethers.provider.getBalance(
        provider.address
      );

      await tripManager.connect(provider).withdrawFunds();

      const finalProviderBalance = await ethers.provider.getBalance(
        provider.address
      );

      // Verifica che il saldo del provider sia aumentato di circa 1 ether (meno il gas)
      expect(finalProviderBalance).to.be.above(initialProviderBalance);
    });

    it("should revert if there are no funds to withdraw", async function () {
      await expect(
        tripManager.connect(provider).withdrawFunds()
      ).to.be.revertedWith("No funds to withdraw");
    });
  });
});
