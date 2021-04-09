import { Message } from 'discord.js';
import _ from 'lodash';
import { botLogger as log } from '../util/log';

const deletionQueue: { msg: Message; time: number }[] = [];
let interval: NodeJS.Timeout;

function update() {
    const now = Date.now();

    const removed = _.remove(deletionQueue, (el) => {
        const shouldDelete = now > el.time;

        if (shouldDelete) {
            el.msg.delete();
        }

        return shouldDelete;
    });

    if (removed.length > 0) {
        log.info(`Deleted ${removed.length} flagged messages.`);
    }
}

export function deleteLater(msg: Message, millis = 5000): Message {
    deletionQueue.push({ msg, time: Date.now() + millis });
    return msg;
}

export async function deleteLaterAsync(
    msg: Promise<Message>,
    millis = 5000
): Promise<Message> {
    deletionQueue.push({ msg: await msg, time: Date.now() + millis });
    return msg;
}

export function setup(): void {
    interval = setInterval(update, 1000);
}

export function stop(): void {
    clearInterval(interval);
}
