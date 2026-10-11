import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { parseEther, getAddress } from "viem";

describe("MilestonePot", async function () {
  const { viem, networkHelpers } = await network.getOrCreate();
  const publicClient = await viem.getPublicClient();

  async function deployPotFixture() {
    const [creator, recipient, contributor1, contributor2, stranger] =
      await viem.getWalletClients();
    const pot = await viem.deployContract("MilestonePot");
    return { pot, creator, recipient, contributor1, contributor2, stranger };
  }

  async function futureTimestamp(secondsFromNow: number) {
    const latest = await networkHelpers.time.latest();
    return BigInt(latest + secondsFromNow);
  }

  it("creates a pot with the expected fields and a unique id", async function () {
    const { pot, creator, recipient } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);

    await viem.assertions.emitWithArgs(
      pot.write.createPot([recipient.account.address, unlockTimestamp, parseEther("1")]),
      pot,
      "PotCreated",
      [
        0n,
        getAddress(creator.account.address),
        getAddress(recipient.account.address),
        unlockTimestamp,
        parseEther("1"),
      ],
    );

    const potId = 0n;
    const stored = await pot.read.getPot([potId]);

    assert.equal(getAddress(stored.recipient), getAddress(recipient.account.address));
    assert.equal(stored.unlockTimestamp, unlockTimestamp);
    assert.equal(stored.targetAmount, parseEther("1"));
    assert.equal(stored.totalContributed, 0n);
    assert.equal(stored.claimed, false);
    assert.equal(await pot.read.potExists([potId]), true);
    assert.equal(await pot.read.potCount(), 1n);

    // a second pot gets the next sequential id
    const unlockTimestamp2 = await futureTimestamp(7200);
    await pot.write.createPot([recipient.account.address, unlockTimestamp2, 0n]);
    const secondId = 1n;
    const secondStored = await pot.read.getPot([secondId]);
    assert.equal(secondStored.unlockTimestamp, unlockTimestamp2);
    assert.equal(await pot.read.potCount(), 2n);
  });

  it("rejects creating a pot with the zero address as recipient", async function () {
    const { pot } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);

    await viem.assertions.revertWithCustomError(
      pot.write.createPot(["0x0000000000000000000000000000000000000000", unlockTimestamp, 0n]),
      pot,
      "InvalidRecipient",
    );
  });

  it("rejects creating a pot with an unlock timestamp in the past or now", async function () {
    const { pot, recipient } = await networkHelpers.loadFixture(deployPotFixture);
    const latest = BigInt(await networkHelpers.time.latest());

    await viem.assertions.revertWithCustomError(
      pot.write.createPot([recipient.account.address, latest, 0n]),
      pot,
      "InvalidUnlockTimestamp",
    );
  });

  it("accepts an optional initial contribution at creation time", async function () {
    const { pot, creator, recipient } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);

    await viem.assertions.emitWithArgs(
      pot.write.createPot([recipient.account.address, unlockTimestamp, 0n], {
        value: parseEther("1"),
      }),
      pot,
      "ContributionMade",
      [0n, getAddress(creator.account.address), parseEther("1"), parseEther("1")],
    );

    const stored = await pot.read.getPot([0n]);
    assert.equal(stored.totalContributed, parseEther("1"));
  });

  it("does not require an initial contribution when creating a pot", async function () {
    const { pot, recipient } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);

    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);

    const stored = await pot.read.getPot([0n]);
    assert.equal(stored.totalContributed, 0n);
  });

  it("accepts a contribution and updates the total", async function () {
    const { pot, recipient, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;

    await viem.assertions.emitWithArgs(
      pot.write.contribute([potId], {
        account: contributor1.account,
        value: parseEther("2"),
      }),
      pot,
      "ContributionMade",
      [potId, getAddress(contributor1.account.address), parseEther("2"), parseEther("2")],
    );

    const stored = await pot.read.getPot([potId]);
    assert.equal(stored.totalContributed, parseEther("2"));
  });

  it("accumulates multiple contributions from different contributors", async function () {
    const { pot, recipient, contributor1, contributor2 } =
      await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;

    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") });
    await pot.write.contribute([potId], { account: contributor2.account, value: parseEther("3") });
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("0.5") });

    const stored = await pot.read.getPot([potId]);
    assert.equal(stored.totalContributed, parseEther("4.5"));

    const contractBalance = await publicClient.getBalance({ address: pot.address });
    assert.equal(contractBalance, parseEther("4.5"));
  });

  it("rejects zero-value contributions", async function () {
    const { pot, recipient, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;

    await viem.assertions.revertWithCustomError(
      pot.write.contribute([potId], { account: contributor1.account, value: 0n }),
      pot,
      "ZeroContribution",
    );
  });

  it("rejects contributions to a pot id that was never created", async function () {
    const { pot, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const nonExistentPotId = 999n;

    assert.equal(await pot.read.potExists([nonExistentPotId]), false);

    await viem.assertions.revertWithCustomError(
      pot.write.contribute([nonExistentPotId], {
        account: contributor1.account,
        value: parseEther("1"),
      }),
      pot,
      "PotDoesNotExist",
    );
  });

  it("rejects contributions after the pot has already been claimed", async function () {
    const { pot, recipient, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(60);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") });

    await networkHelpers.time.increaseTo(unlockTimestamp);
    await pot.write.claim([potId], { account: recipient.account });

    await viem.assertions.revertWithCustomError(
      pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") }),
      pot,
      "PotAlreadyClaimed",
    );
  });

  it("rejects a claim from anyone other than the recipient", async function () {
    const { pot, recipient, contributor1, stranger } =
      await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(60);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") });

    await networkHelpers.time.increaseTo(unlockTimestamp);

    await viem.assertions.revertWithCustomError(
      pot.write.claim([potId], { account: stranger.account }),
      pot,
      "NotRecipient",
    );
  });

  it("rejects a claim from the recipient before the unlock timestamp", async function () {
    const { pot, recipient, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") });

    await viem.assertions.revertWithCustomError(
      pot.write.claim([potId], { account: recipient.account }),
      pot,
      "NotYetUnlocked",
    );
  });

  it("lets the recipient claim after the unlock timestamp and transfers the full balance", async function () {
    const { pot, recipient, contributor1, contributor2 } =
      await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(3600);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("3") });
    await pot.write.contribute([potId], { account: contributor2.account, value: parseEther("2") });

    await networkHelpers.time.increaseTo(unlockTimestamp);

    const claimTx = pot.write.claim([potId], { account: recipient.account });

    await viem.assertions.balancesHaveChanged(claimTx, [
      { address: recipient.account.address, amount: parseEther("5") },
    ]);

    const stored = await pot.read.getPot([potId]);
    assert.equal(stored.claimed, true);

    const contractBalance = await publicClient.getBalance({ address: pot.address });
    assert.equal(contractBalance, 0n);
  });

  it("emits a PotClaimed event with the correct pot id, recipient, and amount", async function () {
    const { pot, recipient, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(60);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") });

    await networkHelpers.time.increaseTo(unlockTimestamp);

    await viem.assertions.emitWithArgs(
      pot.write.claim([potId], { account: recipient.account }),
      pot,
      "PotClaimed",
      [potId, getAddress(recipient.account.address), parseEther("1")],
    );
  });

  it("rejects a second claim on an already-claimed pot", async function () {
    const { pot, recipient, contributor1 } = await networkHelpers.loadFixture(deployPotFixture);
    const unlockTimestamp = await futureTimestamp(60);
    await pot.write.createPot([recipient.account.address, unlockTimestamp, 0n]);
    const potId = 0n;
    await pot.write.contribute([potId], { account: contributor1.account, value: parseEther("1") });

    await networkHelpers.time.increaseTo(unlockTimestamp);
    await pot.write.claim([potId], { account: recipient.account });

    await viem.assertions.revertWithCustomError(
      pot.write.claim([potId], { account: recipient.account }),
      pot,
      "PotAlreadyClaimed",
    );
  });

  it("rejects claiming a pot id that was never created", async function () {
    const { pot, stranger } = await networkHelpers.loadFixture(deployPotFixture);

    await viem.assertions.revertWithCustomError(
      pot.write.claim([999n], { account: stranger.account }),
      pot,
      "PotDoesNotExist",
    );
  });
});
