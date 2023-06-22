import { world } from "@minecraft/server"

world.afterEvents.itemStartUseOn.subscribe((event) => {
    const item = event.itemStack;
    if (item != undefined && item.typeId == "vending:vending_machine_item") {
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


function log(message) {
    world.getAllPlayers().forEach((player) => {
        player.sendMessage(message);
    });
}