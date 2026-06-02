# PORTERFUL FULFILLMENT QUEUE PRE-BUILD DECISION REPORT

## Chosen Option

**Option A**

Fulfillment Queue should automatically clear the reserved quantity for the same fulfillment job when inventory ships.

## Why This Option

- Reserved inventory represents units already committed to a specific order.
- Once those units ship, they should no longer remain reserved.
- This keeps stock truth aligned with real operational state.
- It avoids an extra manual operator step that can create drift or missed releases.

## Inventory Rule

When a fulfillment job ships quantity `X` from reserved inventory:

- `inventory_ledger` records a `ship` movement for quantity `X`
- the reserved quantity tied to that fulfillment job is reduced by `X`
- `available` remains mathematically correct
- `shipped` increases by `X`
- the queue must not require a manual release before ship

## Whether Inventory Ledger Needs Adjustment

**No schema change is required.**

The existing inventory ledger model already supports the needed movements. The rule is a queue-time accounting behavior, not a new table requirement.

The only implementation expectation is that the queue must close the reservation automatically as part of shipping, either by:

- an automatic release event, or
- an equivalent internal reservation-close action

## Whether Fulfillment Queue Can Implement This Without Changing Checkout

**Yes.**

Checkout does not need to change because this rule happens after purchase, at fulfillment time, and only affects inventory accounting and queue state.

The queue can enforce the ship-time reservation closeout independently of checkout, as long as it has access to:

- the SKU
- the fulfillment job
- the reserved quantity
- the ship event

## Summary

This decision keeps Porterful's inventory truth aligned with real fulfillment behavior:

- reserve first
- ship from reserved stock
- automatically close the reservation at ship time
- preserve accurate available inventory
- avoid manual release steps before shipping
