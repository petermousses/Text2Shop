# Text2Shop

## Have you ever gotten a shopping list sent as a text message, where you can't check the items off and can't reorder them?

This lightweight self-hosted app allows you to transform those messages into a functional shopping list!

Shopping list items must be separated by commas and/or new lines. You can also add items, or paste in more text to add on to the same list.

### Example Inputs

Comma separated
```text
oregano, eggs, milk
```

New lines
```text
Cheese
Salami
Bread
```

Both
```text
Milk, ground meat, parmesan
Lasagna noodles
```

## Quickstart

1. Copy the environment file and populate it with your variables. (Only necessary if you are already using traefik as a reverse proxy).

```bash
cp example.env .env
```

2. Start the container.

```bash
docker compose up -d
```

That's it! You will be able to immediately access your container at your configured URL.
