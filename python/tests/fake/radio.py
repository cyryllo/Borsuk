inbox, sent, cfg = [], [], {}


def config(**kw):
    cfg.update(kw)


def on():
    pass


def send_bytes(b):
    sent.append(bytes(b))


def receive_bytes():
    return inbox.pop(0) if inbox else None
