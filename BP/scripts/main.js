import { world, ItemStack } from "@minecraft/server"
import * as UI from "@minecraft/server-ui"

world.afterEvents.itemStartUseOn.subscribe((event) => {
    const item = event.itemStack;
    if (item != undefined && item.typeId != undefined
        && item.typeId == "vending:vending_machine_item") {
        const blockLocation = event.block.location;
        const spawnedMachine = world.getDimension("overworld")
            .spawnEntity("vending:vending_machine",
                {
                    x: blockLocation.x + 0.5,
                    y: blockLocation.y + 1,
                    z: blockLocation.z + 0.5
                });

        const player = event.source;
        spawnedMachine.setRotation({
            x: (player.getRotation().x + 180) % 360,
            y: (player.getRotation().y + 180) % 360
        });

        var playerInventory = event.source.getComponent("inventory").container;

        for (let i = 0; i < playerInventory.size; i++) {
            if (playerInventory.getItem(i) != undefined
                && playerInventory.getItem(i).typeId != undefined
                && playerInventory.getItem(i).typeId == "vending:vending_machine_item") {
                if (playerInventory.getSlot(i).amount > 1) {
                    playerInventory.getSlot(i).amount -= 1;
                    break;
                } else {
                    playerInventory.setItem(i);
                    break;
                }
            }
        }
    }
});


world.afterEvents.itemUse.subscribe((event) => {
    const item = event.itemStack;
    const player = event.source;
    if (item != undefined && item.typeId != undefined
        && item.typeId == "vending:configurer") {
        const entities = player.getEntitiesFromViewDirection();
        if (entities.length != 0 && entities[0].typeId == "vending:vending_machine") {
            const target = entities[0];

            if (!isWithinRange(player, target)) return;

            var oldPriceTag;
            var oldProductTag;

            var password = "NULLPASSWRD";

            if (target.getTags().length > 0) {
                target.getTags().forEach((tag) => {
                    if (tag.includes("PRICE")) {
                        oldPriceTag = tag;
                    } else if (tag.includes("PROD")) {
                        oldProductTag = tag;
                    } else if (tag.includes("PWRD")) {
                        password = tag.split(":")[1];
                    }
                });
            }

            var prefillPriceItem = "emerald";
            var prefillPriceAmount = 1;
            var prefillProductItem = "coal";
            var prefillProductAmount = 1;

            if (oldPriceTag != undefined && oldProductTag != undefined) {
                prefillPriceItem = oldPriceTag.split(":")[1];
                prefillPriceAmount = parseInt(oldPriceTag.split(":")[2]);
                prefillProductItem = oldProductTag.split(":")[1];
                prefillProductAmount = parseInt(oldProductTag.split(":")[2]);
            }

            if (password != "NULLPASSWRD") {
                var enteredPassword = "";
                let modal = new UI.ModalFormData()
                    .title("§5Vending Machine§r Login")
                    .textField("Enter Password", "")
                    .show(player).then((formData) => {
                        if (formData.formValues != undefined) {
                            enteredPassword = formData.formValues[0];
                            if (enteredPassword != password) {
                                player.sendMessage(
                                    "§4The password you entered was incorrect."
                                );
                                return;
                            }

                            let modal2 = new UI.ModalFormData()
                                .title("§5Vending Machine")
                                .textField("Vendor Recieves:", "emerald", prefillPriceItem)
                                .slider("Amount", 1, 64, 1, prefillPriceAmount)
                                .textField("Customer Recieves:", "coal", prefillProductItem)
                                .slider("Amount", 1, 64, 1, prefillProductAmount)
                                .textField("Set password", password, password)
                                .show(player).then((response) => {
                                    if (response.formValues != undefined) {
                                        if (target.getTags().length > 0) {
                                            target.getTags().forEach((tag) => {
                                                target.removeTag(tag);
                                            });
                                        }

                                        var priceName = response.formValues[0].replace(/\s+/g, '')
                                            .toLowerCase();
                                        var productName = response.formValues[2].replace(/\s+/g, '')
                                            .toLowerCase();
                                        var priceAmount = response.formValues[1];
                                        var productAmount = response.formValues[3];

                                        password = response.formValues[4];

                                        var priceTag = `PRICE:${priceName}:${priceAmount}`;
                                        var productTag = `PROD:${productName}:${productAmount}`;
                                        var passwordTag = `PWRD:${password}`;
                                        target.addTag(priceTag);
                                        target.addTag(productTag);
                                        target.addTag(passwordTag);
                                    }
                                    return;
                                });
                        }
                    });
            } else {
                password = "";
                let modal = new UI.ModalFormData()
                    .title("§5Vending Machine")
                    .textField("Vendor Recieves:", "emerald", prefillPriceItem)
                    .slider("Amount", 1, 64, 1, prefillPriceAmount)
                    .textField("Customer Recieves:", "coal", prefillProductItem)
                    .slider("Amount", 1, 64, 1, prefillProductAmount)
                    .textField("Set password", password, password)
                    .show(player).then((response) => {
                        if (response.formValues != undefined) {
                            if (target.getTags().length > 0) {
                                target.getTags().forEach((tag) => {
                                    target.removeTag(tag);
                                });
                            }

                            var priceName = response.formValues[0].replace(/\s+/g, '')
                                .toLowerCase();
                            var productName = response.formValues[2].replace(/\s+/g, '')
                                .toLowerCase();
                            var priceAmount = response.formValues[1];
                            var productAmount = response.formValues[3];

                            password = response.formValues[4];

                            var priceTag = `PRICE:${priceName}:${priceAmount}`;
                            var productTag = `PROD:${productName}:${productAmount}`;
                            var passwordTag = `PWRD:${password}`;
                            target.addTag(priceTag);
                            target.addTag(productTag);
                            target.addTag(passwordTag);
                        }
                    });
            }
        }
    } else if (item != undefined && item.typeId != undefined
        && item.typeId == "vending:vending_machine_key") {
        const entities = player.getEntitiesFromViewDirection();
        if (entities.length != 0 && entities[0].typeId == "vending:vending_machine") {
            const target = entities[0];

            if (!isWithinRange(player, target)) return;

            var password = "NULLPASSWRD";
            if (target.getTags().length > 0) {
                target.getTags().forEach((tag) => {
                    if (tag.includes("PWRD")) {
                        password = tag.split(":")[1];
                    }
                });
            }

            if (password != "NULLPASSWRD") {
                var enteredPassword = "";
                let modal = new UI.ModalFormData()
                    .title("§5Vending Machine§r Login")
                    .textField("Enter Password", "")
                    .show(player).then((formData) => {
                        if (formData.formValues != undefined) {
                            enteredPassword = formData.formValues[0];
                            if (enteredPassword != password) {
                                player.sendMessage("§4The password you entered was incorrect.");
                                return;
                            }
                        } else {
                            return;
                        }
                        const targetInventory = target.getComponent("inventory").container;
                        for (let i = 0; i < targetInventory.size; i++) {
                            if (targetInventory.getItem(i) != undefined
                                && targetInventory.getItem(i).typeId != undefined) {
                                const targetItem = targetInventory.getItem(i);
                                world.getDimension("overworld").
                                    spawnItem(targetItem, player.location);

                                targetInventory.setItem(i);
                            }
                        }
                    })
            } else {
                return;
            }
        }
    } else if (item != undefined) {
        const entities = player.getEntitiesFromViewDirection();
        if (entities.length != 0 && entities[0].typeId == "vending:vending_machine") {
            const target = entities[0];

            if (!isWithinRange(player, target)) return;

            var priceTag;
            var productTag;

            if (target.getTags().length > 0) {
                target.getTags().forEach((tag) => {
                    if (tag.includes("PRICE")) {
                        priceTag = tag;
                    } else if (tag.includes("PROD")) {
                        productTag = tag;
                    }
                });
            }
            var priceItem = "";
            var priceAmount = 0;
            var productItem = "";
            var productAmount = 0;

            if (priceTag != undefined && productTag != undefined) {
                priceItem = priceTag.split(":")[1];
                priceAmount = parseInt(priceTag.split(":")[2]);
                productItem = productTag.split(":")[1];
                productAmount = parseInt(productTag.split(":")[2]);
            } else return;


            const targetInventory = target.getComponent("inventory").container;
            const playerInventory = player.getComponent("inventory").container;

            var targetItem = undefined;
            if (item.typeId.split(":")[1] == priceItem) {
                if (item.amount >= priceAmount) {
                    var foundAvailableProduct = false;
                    for (let i = 0; i < targetInventory.size; i++) {
                        if (targetInventory.getItem(i) != undefined
                            && targetInventory.getItem(i).typeId != undefined) {
                            targetItem = targetInventory.getItem(i);
                            if (targetItem.typeId.split(":")[1] == productItem) {
                                if (targetItem.amount >= productAmount) {
                                    if (targetItem.amount - productAmount > 0) {
                                        targetInventory.getSlot(i).amount -= productAmount;
                                    } else {
                                        targetInventory.setItem(i);
                                    }

                                    for (let j = 0; j < playerInventory.size; j++) {
                                        const playerItem = playerInventory.getSlot(j);
                                        if (playerItem != undefined
                                            && playerItem.typeId != undefined
                                            && playerItem.typeId.split(":")[1]
                                            == priceItem
                                            && playerItem.amount == item.amount) {

                                            if (item.amount - priceAmount > 0) {
                                                playerItem.amount -= priceAmount;
                                            } else {
                                                playerInventory.setItem(j);
                                            }

                                            targetInventory
                                                .addItem(
                                                    new ItemStack(
                                                        priceItem, priceAmount
                                                    )
                                                );
                                            break;
                                        }
                                    }
                                    foundAvailableProduct = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (foundAvailableProduct) {
                        world.getDimension("overworld").
                            spawnItem(new ItemStack(targetItem.typeId, productAmount),
                                player.location);
                    } else {
                        player.sendMessage("This vending machine is out of stock!");
                    }

                } else {
                    player.sendMessage(`You don't have enough §a${priceItem}!`);
                }
            } else if (item.typeId.split(":")[1] == productItem) {
                for (let i = 0; i < playerInventory.size; i++) {
                    const playerItem = playerInventory.getSlot(i);
                    if (playerItem != undefined && playerItem.typeId != undefined
                        && playerItem.typeId.split(":")[1] == productItem) {
                        if (playerItem.amount - 1 > 0) {
                            playerItem.amount -= 1;
                        } else {
                            playerInventory.setItem(i);
                        }
                        targetInventory.addItem(new ItemStack(productItem, 1));
                        break;
                    }
                }
            }
        }
    }
});

function passwordPrompt(player) {
    var enteredPassword = "";
    let modal = new UI.ModalFormData()
        .title("§5Vending Machine§r Login")
        .textField("Enter Password", "")
        .show(player).then((response) => {
            if (response != undefined) {
                enteredPassword = response.formValues[0];
            }
        });

    return enteredPassword;
}

function isWithinRange(player, target) {
    const playerLoc = player.location;
    var targetLoc = target.location;

    const maxDist = 4;
    const checkX = targetLoc.x - playerLoc.x < maxDist
        && targetLoc.x - playerLoc.x > -maxDist;
    const checkY = targetLoc.y - playerLoc.y < maxDist
        && targetLoc.y - playerLoc.y > -maxDist;
    const checkZ = targetLoc.z - playerLoc.z < maxDist
        && targetLoc.z - playerLoc.z > -maxDist;
    return (checkX && checkY && checkZ);
}

function log(message) {
    world.getAllPlayers().forEach((player) => {
        player.sendMessage(message);
    });
}