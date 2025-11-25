import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, normalize
import unicodedata

# ---------------------------------------------------
# 🔧 Normalização de texto
# ---------------------------------------------------
def normalizar(texto):
    # Caso o texto seja NaN, retorna string vazia
    if pd.isna(texto):
        return ""
    # Converte para minúsculas
    texto = str(texto).lower()
    # Remove acentuação e caracteres especiais
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    # Remove espaços duplicados
    texto = " ".join(texto.split())
    # Retorna texto limpo
    return texto.strip()


# ---------------------------------------------------
# 📂 Carregar dados
# ---------------------------------------------------
csv_path = "dados_pacientes_exames_500_atualizado.csv"
df = pd.read_csv(csv_path)

# Normaliza colunas textuais
df["patologia"] = df["patologia"].apply(normalizar)
df["medicamento"] = df["medicamento"].apply(normalizar)
df["mapa"] = df["mapa"].apply(normalizar)

# ---------------------------------------------------
# 🧭 Sidebar – Navegação entre páginas
# ---------------------------------------------------
st.sidebar.title("📌 Menu")

pagina = st.sidebar.radio(
    "Ir para:",
    ["Recomendador de Exames", "Dashboard"]
)

# ===================================================
# ===================  PAGINA 1 =====================
# ===================================================
if pagina == "Recomendador de Exames":

    st.title("🧠 Recomendador de Exames por Similaridade")

    # ---------------------------------------------------
    # 🔠 Vetorização TF-IDF (texto → números)
    # ---------------------------------------------------
    # Cada patologia e medicamento vira um vetor numérico usando NLP
    tfidf_pat = TfidfVectorizer(ngram_range=(1,2), max_features=300)
    tfidf_med = TfidfVectorizer(ngram_range=(1,2), max_features=300)

    # Transforma as colunas em matrizes esparsas
    pat_vec = tfidf_pat.fit_transform(df["patologia"])
    med_vec = tfidf_med.fit_transform(df["medicamento"])

    # ---------------------------------------------------
    # 🎚 Normalização da idade
    # ---------------------------------------------------
    idade = df[["idade"]].fillna(df["idade"].mean())
    idade_scaled = StandardScaler().fit_transform(idade) * 2.0  # peso maior para idade

    # ---------------------------------------------------
    # 🧩 Matriz final de features
    # ---------------------------------------------------
    # Junta: [idade normalizada + TF-IDF patologia + TF-IDF medicamento]
    X = np.hstack([idade_scaled, pat_vec.toarray(), med_vec.toarray()])
    X = normalize(X)  # normaliza vetor final

    # Array com os exames reais dos pacientes
    exames = df["exame_texto"].values

    # ---------------------------------------------------
    # 🎯 Sidebar – número de vizinhos no KNN
    # ---------------------------------------------------
    num_vizinhos = st.sidebar.slider("Número de pacientes semelhantes:", 1, 20, 5)

    # ---------------------------------------------------
    # 🧠 Modelo KNN (Busca pacientes semelhantes)
    # ---------------------------------------------------
    knn = NearestNeighbors(n_neighbors=num_vizinhos, metric="cosine")
    knn.fit(X)

    # Caixa de expansão para mostrar amostra dos dados
    with st.expander("📋 Ver dados"):
        st.dataframe(df.head())

    # ---------------------------------------------------
    # 📝 Formulário para inserir novo paciente
    # ---------------------------------------------------
    st.subheader("💡 Recomendar exame para novo paciente")

    col1, col2 = st.columns(2)
    with col1:
        idade_input = st.number_input("Idade:", 1, 120, 40)
    with col2:
        patologia_input = st.text_input("Patologia:")

    medicamento_input = st.text_input("Medicamento:")
    num_exames = st.slider("Qtd. exames recomendados:", 1, 10, 3)

    # ---------------------------------------------------
    # 🔍 Quando o usuário clica em "Recomendar"
    # ---------------------------------------------------
    if st.button("🔎 Recomendar"):

        # Garante que pelo menos 1 campo de texto foi preenchido
        if patologia_input.strip() == "" and medicamento_input.strip() == "":
            st.warning("Informe pelo menos patologia ou medicamento.")
        else:
            # ----------------------------
            # Normaliza a idade informada
            # ----------------------------
            media_idade = df["idade"].mean()
            desvio_idade = df["idade"].std()
            idade_norm = (idade_input - media_idade) / desvio_idade * 2.0

            # ----------------------------
            # Transforma entrada em TF-IDF
            # ----------------------------
            pat_new = tfidf_pat.transform([normalizar(patologia_input)]).toarray()
            med_new = tfidf_med.transform([normalizar(medicamento_input)]).toarray()

            # Cria vetor final do novo paciente
            X_new = np.hstack([[idade_norm], pat_new[0], med_new[0]]).reshape(1,-1)
            X_new = normalize(X_new)

            # Busca vizinhos mais próximos
            dist, idx = knn.kneighbors(X_new)

            # Faz contagem dos exames dos pacientes similares
            exames_recomendados = pd.Series(exames[idx[0]]).value_counts().head(num_exames)

            # Exibe recomendações
            st.success("🧩 Exames recomendados:")
            st.table(exames_recomendados.rename_axis("Exame").reset_index(name="Frequência"))

            # Mostra os pacientes mais parecidos
            st.info("👥 Pacientes semelhantes:")
            st.dataframe(df.iloc[idx[0]][["id_paciente","idade","patologia","medicamento","exame_texto","mapa"]])

# ===================================================
# ===================  PAGINA 2 =====================
# ===================================================
else:
    st.title("📊 Dashboard de Análise")

    # Menu lateral para escolher tipo de KPI
    opcao = st.sidebar.selectbox(
        "Escolha o tipo de KPI",
        ["Quantidade de Pacientes", "Idade", "MAPA"]
    )

    col1, col2, col3 = st.columns(3)

    # ---------------------------------------------------
    # 📌 KPIs de quantidade geral
    # ---------------------------------------------------
    if opcao == "Quantidade de Pacientes":
        col1.metric("📌 Total de Pacientes", len(df))
        col2.metric("🩺 Patologias únicas", df["patologia"].nunique())
        col3.metric("💊 Medicamentos únicos", df["medicamento"].nunique())

    # ---------------------------------------------------
    # 📌 KPIs Estatísticos da Idade
    # ---------------------------------------------------
    elif opcao == "Idade":
        media     = df["idade"].mean()
        mediana   = df["idade"].median()
        moda      = df["idade"].mode()[0]
        desvio    = df["idade"].std()
        variancia = df["idade"].var()

        col1.metric("📊 Média da Idade", round(media, 2))
        col2.metric("📌 Mediana da Idade", round(mediana, 2))
        col3.metric("🔁 Moda da Idade", moda)

        c4, c5 = st.columns(2)
        c4.metric("📉 Desvio Padrão", round(desvio, 2))
        c5.metric("📈 Variância", round(variancia, 2))

    # ---------------------------------------------------
    # 📌 KPIs dos MAPAS (categorias de exames)
    # ---------------------------------------------------
    else:
        col1.metric("🧪 MAPAs únicos", df["mapa"].nunique())
        col2.metric("🔬 Exames únicos", df["exame_texto"].nunique())
        col3.metric("📊 MAPA mais frequente", df["mapa"].mode()[0])

    # ---------------------------------------------------
    # 📊 Gráficos do Dashboard
    # ---------------------------------------------------
    st.subheader("📈 Distribuição de Idades")
    st.plotly_chart(px.histogram(df, x="idade", nbins=20), use_container_width=True)

    st.subheader("🏥 Patologias mais comuns")
    top_pat = df["patologia"].value_counts().head(10)
    st.plotly_chart(px.bar(top_pat, x=top_pat.index, y=top_pat.values), use_container_width=True)

    st.subheader("💊 Medicamentos mais usados")
    top_med = df["medicamento"].value_counts().head(10)
    st.plotly_chart(px.bar(top_med, x=top_med.index, y=top_med.values), use_container_width=True)

    st.subheader("🔬 Exames mais solicitados")
    top_exames = df["exame_texto"].value_counts().head(10)
    st.plotly_chart(px.pie(values=top_exames.values, names=top_exames.index), use_container_width=True)

    st.subheader("🧪 MAPAs mais frequentes")
    top_mapas = df["mapa"].value_counts().head(10)
    st.plotly_chart(px.bar(top_mapas, x=top_mapas.index, y=top_mapas.values), use_container_width=True)
