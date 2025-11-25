# Script Streamlit que constrói um recomendador de exames por similaridade
# e um dashboard simples. Comentários adicionados para facilitar entendimento.

# ---------- IMPORTS ----------
# Bibliotecas para interface (streamlit), manipulação de dados (pandas/numpy),
# visualização (plotly) e modelagem (sklearn).
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
# - remove acentuação, deixa minúsculo e limpa espaços extras.
# - evita problemas de TF-IDF por diferenças de encoding/acentuação.
def normalizar(texto):
    if pd.isna(texto):
        return ""
    texto = str(texto).lower()
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    texto = " ".join(texto.split())
    return texto.strip()

# ---------------------------------------------------
# 📂 Carregar dados
# - lê o CSV com registros sintéticos de pacientes/exames
# - aplica normalização em colunas textuais relevantes
csv_path = "dados_pacientes_exames_500.csv"
df = pd.read_csv(csv_path)

# Normaliza texto para reduzir variância (acentos, maiúsculas, espaços)
df["patologia"] = df["patologia"].apply(normalizar)
df["medicamento"] = df["medicamento"].apply(normalizar)

# ---------------------------------------------------
# 🧭 Sidebar – Navegação
# - permite trocar entre recomendador e dashboard
st.sidebar.title("📌 Menu")

pagina = st.sidebar.radio(
    "Ir para:",
    ["Recomendador de Exames", "Dashboard"]
)

# ===================================================
# ===================  PAGINA 1: RECOMENDADOR  =====================
# - Usa TF-IDF em patologia e medicamento + escala de idade
# - Agrupa características e aplica NearestNeighbors (cosine) para achar pacientes semelhantes
if pagina == "Recomendador de Exames":

    st.title("🧠 Recomendador de Exames por Similaridade")

    # --------- TF-IDF: vetoriza patologia e medicamento
    tfidf_pat = TfidfVectorizer(ngram_range=(1,2), max_features=300)
    tfidf_med = TfidfVectorizer(ngram_range=(1,2), max_features=300)

    # Ajusta vetores para todo o dataset
    pat_vec = tfidf_pat.fit_transform(df["patologia"])
    med_vec = tfidf_med.fit_transform(df["medicamento"])

    # ---------- Idade escalada
    # - preenche NaN com média e aplica StandardScaler (multiplica por 2 para dar mais peso)
    idade = df[["idade"]].fillna(df["idade"].mean())
    idade_scaled = StandardScaler().fit_transform(idade) * 2.0

    # ---------- Matriz final de características
    # - concatena idade escalada e vetores TF-IDF
    X = np.hstack([idade_scaled, pat_vec.toarray(), med_vec.toarray()])
    X = normalize(X)  # normaliza vetores para uso de cosine similarity

    # guarda lista de exames (texto) para mostrar recomendações
    exames = df["exame_texto"].values

    # ---------- Parâmetros UI
    num_vizinhos = st.sidebar.slider("Número de pacientes semelhantes:", 1, 20, 5)

    # ---------- Treina o KNN (apenas leitura, usa cosine)
    knn = NearestNeighbors(n_neighbors=num_vizinhos, metric="cosine")
    knn.fit(X)

    # Exibir dados brutos opcionalmente
    with st.expander("📋 Ver dados"):
        st.dataframe(df.head())

    # --------- Formulário para novo paciente
    st.subheader("💡 Recomendar exame para novo paciente")

    col1, col2 = st.columns(2)
    with col1:
        idade_input = st.number_input("Idade:", 1, 120, 40)
    with col2:
        patologia_input = st.text_input("Patologia:")

    medicamento_input = st.text_input("Medicamento:")
    num_exames = st.slider("Qtd. exames recomendados:", 1, 10, 3)

    # Ao clicar em Recomendar:
    if st.button("🔎 Recomendar"):

        # validação mínima
        if patologia_input.strip() == "" and medicamento_input.strip() == "":
            st.warning("Informe pelo menos patologia ou medicamento.")
        else:
            # ---------- Preparar vetor do novo paciente
            media_idade = df["idade"].mean()
            desvio_idade = df["idade"].std()
            idade_norm = (idade_input - media_idade) / desvio_idade * 2.0

            # transforma texto com os mesmos vetorizadores treinados
            pat_new = tfidf_pat.transform([normalizar(patologia_input)]).toarray()
            med_new = tfidf_med.transform([normalizar(medicamento_input)]).toarray()

            # monta vetor e normaliza
            X_new = np.hstack([[idade_norm], pat_new[0], med_new[0]]).reshape(1,-1)
            X_new = normalize(X_new)

            # encontra vizinhos mais próximos
            dist, idx = knn.kneighbors(X_new)

            # recomenda exames mais frequentes entre vizinhos
            exames_recomendados = pd.Series(exames[idx[0]]).value_counts().head(num_exames)

            st.success("🧩 Exames recomendados:")
            st.table(exames_recomendados.rename_axis("Exame").reset_index(name="Frequência"))

            st.info("👥 Pacientes semelhantes:")
            st.dataframe(df.iloc[idx[0]][["id_paciente","idade","patologia","medicamento","exame_texto"]])

# ===================================================
# ===================  PAGINA 2: DASHBOARD  =====================
# - Estatísticas rápidas e gráficos dos dados carregados
else:
    st.title("📊 Dashboard de Análise")

    # escolha do KPI
    opcao = st.sidebar.selectbox(
        "Escolha o tipo de KPI",
        ["Quantidade de Pacientes", "Idade"]
    )

    col1, col2, col3 = st.columns(3)

    # --------- KPIs de Quantidade ---------
    if opcao == "Quantidade de Pacientes":
        col1.metric("📌 Total de Pacientes", len(df))
        col2.metric("🩺 Patologias únicas", df["patologia"].nunique())
        col3.metric("💊 Medicamentos únicos", df["medicamento"].nunique())

    # --------- KPIs Estatísticos de Idade ---------
    else:
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

    # --------- Gráficos ---------
    st.subheader("📈 Distribuição de Idades")
    st.plotly_chart(
        px.histogram(df, x="idade", nbins=20), 
        use_container_width=True
    )

    st.subheader("🏥 Patologias mais comuns")
    top_pat = df["patologia"].value_counts().head(10)
    st.plotly_chart(
        px.bar(top_pat, x=top_pat.index, y=top_pat.values),
        use_container_width=True
    )

    st.subheader("💊 Medicamentos mais usados")
    top_med = df["medicamento"].value_counts().head(10)
    st.plotly_chart(
        px.bar(top_med, x=top_med.index, y=top_med.values),
        use_container_width=True
    )

    st.subheader("🔬 Exames mais solicitados")
    top_exames = df["exame_texto"].value_counts().head(10)
    st.plotly_chart(
        px.pie(values=top_exames.values, names=top_exames.index),
        use_container_width=True
    )

