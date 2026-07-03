from sqlmodel import Session, select
from .database import engine
from .models import Produto


SEED_PRODUTOS = [
    # ── Lanches ─────────────────────────────────────────────────────────────
    {
        "nome": "Classic Burger",
        "descricao": "Pão brioche, blend 180g, queijo cheddar, alface, tomate e maionese especial",
        "preco": 28.90,
        "categoria": "lanche",
        "imagem_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    },
    {
        "nome": "Double Smash",
        "descricao": "Dois smash patties 90g, queijo americano duplo, cebola caramelizada e molho secreto",
        "preco": 36.90,
        "categoria": "lanche",
        "imagem_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80",
    },
    {
        "nome": "Bacon Extreme",
        "descricao": "Blend 200g, bacon crocante, queijo prato, barbecue defumado e cebola crispy",
        "preco": 39.90,
        "categoria": "lanche",
        "imagem_url": "https://images.unsplash.com/photo-1586816001966-79b736744398?w=600&q=80",
    },
    {
        "nome": "Veggie Delight",
        "descricao": "Hambúrguer de grão-de-bico, rúcula, tomate seco, brie e pesto de manjericão",
        "preco": 32.90,
        "categoria": "lanche",
        "imagem_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80",
    },
    {
        "nome": "Frango Crispy",
        "descricao": "Frango empanado crocante, coleslaw, picles e maionese de mel mostarda",
        "preco": 31.90,
        "categoria": "lanche",
        "imagem_url": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80",
    },
    {
        "nome": "BBQ Texano",
        "descricao": "Blend defumado 220g, anéis de cebola, queijo gouda, barbecue artesanal",
        "preco": 42.90,
        "categoria": "lanche",
        "imagem_url": "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=600&q=80",
    },
    # ── Acompanhamentos ──────────────────────────────────────────────────────
    {
        "nome": "Batata Frita Clássica",
        "descricao": "Batatas palito crocantes com sal e páprica defumada",
        "preco": 14.90,
        "categoria": "acompanhamento",
        "imagem_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
    },
    {
        "nome": "Onion Rings",
        "descricao": "Anéis de cebola empanados com massa crocante e molho aioli",
        "preco": 16.90,
        "categoria": "acompanhamento",
        "imagem_url": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&q=80",
    },
    {
        "nome": "Batata Rústica",
        "descricao": "Batata com casca assada com ervas finas e alho",
        "preco": 15.90,
        "categoria": "acompanhamento",
        "imagem_url": "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600&q=80",
    },
    # ── Bebidas ──────────────────────────────────────────────────────────────
    {
        "nome": "Refrigerante Lata",
        "descricao": "Coca-Cola, Guaraná ou Sprite — lata 350ml",
        "preco": 7.90,
        "categoria": "bebida",
        "imagem_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80",
    },
    {
        "nome": "Milk Shake Artesanal",
        "descricao": "Chocolate, morango ou baunilha — 400ml com chantilly",
        "preco": 22.90,
        "categoria": "bebida",
        "imagem_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80",
    },
    {
        "nome": "Suco Natural",
        "descricao": "Laranja, limão ou maracujá — 500ml",
        "preco": 12.90,
        "categoria": "bebida",
        "imagem_url": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80",
    },
    {
        "nome": "Água Mineral",
        "descricao": "Garrafa 500ml — com ou sem gás",
        "preco": 5.90,
        "categoria": "bebida",
        "imagem_url": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
    },
    # ── Sobremesas ───────────────────────────────────────────────────────────
    {
        "nome": "Brownie com Sorvete",
        "descricao": "Brownie quentinho de chocolate com sorvete de creme e calda quente",
        "preco": 19.90,
        "categoria": "sobremesa",
        "imagem_url": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80",
    },
    {
        "nome": "Cookie Artesanal",
        "descricao": "Cookie de chocolate com gotas de chocolate meio amargo — unidade",
        "preco": 9.90,
        "categoria": "sobremesa",
        "imagem_url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    },
]


def seed():
    with Session(engine) as session:
        existing = session.exec(select(Produto)).first()
        if existing:
            return
        for data in SEED_PRODUTOS:
            session.add(Produto(**data))
        session.commit()
