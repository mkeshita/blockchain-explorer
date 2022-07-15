import { Cell } from "../../boc/Cell";
import { Maybe } from "../../types";
import { Message } from "../../messages/Message";

export class WalletV2SigningMessage implements Message {

    readonly timeout: number;
    readonly seqno: number;
    readonly order: Message;
    readonly sendMode: number;

    constructor(args: { timeout?: Maybe<number>, seqno: Maybe<number>, sendMode: number, order: Message }) {
        this.order = args.order;
        this.sendMode = args.sendMode;
        if (args.timeout !== undefined && args.timeout !== null) {
            this.timeout = args.timeout;
        } else {
            this.timeout = Math.floor(Date.now() / 1e3) + 60; // Default timeout: 60 seconds
        }
        if (args.seqno !== undefined && args.seqno !== null) {
            this.seqno = args.seqno;
        } else {
            this.seqno = 0;
        }
    }

    writeTo(cell: Cell) {
        cell.bits.writeUint(this.seqno, 32);
        if (this.seqno === 0) {
            for (let i = 0; i < 32; i++) {
                cell.bits.writeBit(1);
            }
        } else {
            cell.bits.writeUint(this.timeout, 32);
        }
        cell.bits.writeUint8(this.sendMode);

        // Write order
        let orderCell = new Cell();
        this.order.writeTo(orderCell);
        cell.refs.push(orderCell);
    }
}