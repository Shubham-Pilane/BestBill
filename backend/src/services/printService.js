const { getIO } = require('../socket');

/**
 * Service to generate print payloads and emit them to registered print agents.
 */
class PrintService {
  /**
   * Emits a raw print job to the hotel room.
   * @param {number|string} hotelId 
   * @param {object} payload 
   * @returns {boolean}
   */
  emitPrintJob(hotelId, payload) {
    try {
      const io = getIO();
      if (!io) {
        console.warn(`[PRINT SERVICE] Socket server not initialized yet.`);
        return false;
      }

      const roomName = `hotel-${hotelId}`;
      console.log(`[PRINT SERVICE] Emitting print-job (${payload.type}) to room: ${roomName}`);
      io.to(roomName).emit('print-job', payload);
      return true;
    } catch (err) {
      console.error(`[PRINT SERVICE] Failed to emit print job:`, err.message);
      return false;
    }
  }

  /**
   * Generates and emits a KOT (Kitchen Order Ticket) payload.
   * @param {object} params
   * @param {number|string} params.hotelId
   * @param {string} params.table - Table or Room number string
   * @param {string} [params.waiter] - Waiter name
   * @param {Array<{name: string, quantity: number}>} params.items
   * @param {string} [params.notes]
   */
  sendKOT({ hotelId, table, waiter, items, notes }) {
    const payload = {
      type: 'KOT',
      printer: 'kitchen',
      hotelId: Number(hotelId),
      table: String(table),
      waiter: waiter || 'Staff',
      items: items.map(item => ({
        name: item.name,
        qty: Number(item.quantity || item.qty || 1)
      })),
      notes: notes || ''
    };

    return this.emitPrintJob(hotelId, payload);
  }

  /**
   * Generates and emits a FINAL_BILL payload.
   * @param {object} params
   * @param {number|string} params.hotelId
   * @param {number|string} params.billId
   * @param {string} params.table - Table or Room number string
   * @param {number} params.subtotal
   * @param {number} params.gst
   * @param {number} params.finalAmount
   * @param {number} params.discountPercentage
   * @param {Array<{name: string, price: number, quantity: number}>} params.items
   */
  sendFinalBill({ hotelId, billId, table, subtotal, gst, finalAmount, discountPercentage, items, hotelName, hotelPhone, hotelLocation }) {
    const payload = {
      type: 'FINAL_BILL',
      printer: 'billing',
      hotelId: Number(hotelId),
      billId: Number(billId),
      table: String(table),
      subtotal: Number(subtotal),
      gst: Number(gst),
      finalAmount: Number(finalAmount),
      discountPercentage: Number(discountPercentage || 0),
      items: items.map(item => ({
        name: item.name,
        price: Number(item.price),
        qty: Number(item.quantity || item.qty || 1)
      })),
      hotelName: hotelName || '',
      hotelPhone: hotelPhone || '',
      hotelLocation: hotelLocation || ''
    };

    return this.emitPrintJob(hotelId, payload);
  }
}

module.exports = new PrintService();
