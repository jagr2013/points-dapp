;; Simple Points Contract

(define-map points { user: principal } { score: uint })

;; Add points to a user
(define-public (add-points (amount uint))
  (let ((current (default-to u0 (get score (map-get? points { user: tx-sender })))))
    (map-set points { user: tx-sender } { score: (+ current amount) })
    (ok "Points added")
  )
)

;; Deduct points from a user
(define-public (deduct-points (amount uint))
  (let ((current (default-to u0 (get score (map-get? points { user: tx-sender })))))
    (if (>= current amount)
        (begin
          (map-set points { user: tx-sender } { score: (- current amount) })
          (ok "Points deducted")
        )
        (err u101)
    )
  )
)

;; Check points of a user
(define-read-only (get-points (user principal))
  (default-to u0 (get score (map-get? points { user }))))
