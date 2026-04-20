export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type OrderPaymentMethod = 'cod' | 'online';
export type OrderPaymentStatus = 'awaiting_cod' | 'awaiting_payment' | 'paid';

export type OrderAction =
  | 'confirm'
  | 'handover'
  | 'mark_delivered'
  | 'collect_cod'
  | 'complete';

export type OrderFlowShape = {
  status: OrderStatus;
  paymentMethod?: OrderPaymentMethod | null;
  paymentStatus?: OrderPaymentStatus | null;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao hàng',
  completed: 'Thành công',
  cancelled: 'Đã hủy',
};

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  awaiting_cod: 'Chờ thu COD',
  awaiting_payment: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
};

export function canOrderBeCancelled(status: OrderStatus) {
  return status === 'pending' || status === 'processing' || status === 'shipping';
}

export function canCompleteOrder(order: OrderFlowShape) {
  return order.status === 'delivered' && order.paymentStatus === 'paid';
}

export function getAdminOrderActions(order: OrderFlowShape): OrderAction[] {
  const actions: OrderAction[] = [];

  if (order.status === 'pending') actions.push('confirm');
  if (order.status === 'processing') actions.push('handover');
  if (order.status === 'shipping') actions.push('mark_delivered');
  if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && order.status !== 'cancelled') {
    actions.push('collect_cod');
  }
  if (canCompleteOrder(order)) actions.push('complete');

  return actions;
}

export function getOrderActionLabel(action: OrderAction) {
  if (action === 'confirm') return 'Xác nhận đơn';
  if (action === 'handover') return 'Bàn giao vận chuyển';
  if (action === 'mark_delivered') return 'Đánh dấu đã giao';
  if (action === 'collect_cod') return 'Đã thu COD';
  return 'Hoàn tất đơn';
}
