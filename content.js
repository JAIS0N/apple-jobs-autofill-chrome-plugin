function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function setReactValue(el, value) {
  if (!el) return false;
  const proto = Object.getPrototypeOf(el);
  const desc = Object.getOwnPropertyDescriptor(proto, "value");
  if (desc && desc.set) desc.set.call(el, value);
  else el.value = value;
  el.dispatchEvent(new InputEvent("input", { bubbles: true, data: value, inputType: "insertText" }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
  return true;
}

function normalize(text) {
  return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function getEmploymentCards() {
  return [...document.querySelectorAll("textarea")].map((textarea) => {
    let node = textarea;
    for (let i = 0; i < 8 && node; i++) {
      const text = normalize(node.innerText);
      if (text.includes("employer") && text.includes("job title") && text.includes("job description"))
        return { textarea, container: node };
      node = node.parentElement;
    }
    return null;
  }).filter(Boolean);
}

function extractEmployer(container) {
  const input = [...container.querySelectorAll("input")].find(i => {
    const v = normalize(i.value);
    return v && !["yes", "no", "month", "year"].includes(v) && v.length > 2;
  });
  return input ? normalize(input.value) : "";
}

const descriptions = {
  ml: {
    "ancestry": `• Reduced compliance review time by 60% across 100+ repositories by developing an automated auditing tool using GitHub MCP and a large language model to detect missing internal headers in inbound and outbound service calls.
• Developing AI agents using LangGraph integrating LangFuse for tracing and evaluation and LiteLLM for multi-provider routing, fallback handling, and cost tracking, improving reliability and observability of production LLM workflows.
• Accelerating real-time genomic predictions by optimizing a CNN-based classifier using TorchScript (JIT) and ONNX for high-performance inference via FastAPI.`,

    "institutional research": `• Improved access to student analytics by building a web app with natural language querying using Python, Flask, Pydantic AI, and large language models.
• Fine-tuned LightGBM with scikit-learn feature pipelines and hyperparameter optimization to reduce bias by 14% (lower equal opportunity difference) without degrading AUC-ROC, improving admission decision quality.
• Implemented PyTorch classifier for student dropout risk with class-imbalance handling and calibrated thresholds, improving F1 by 20% and AUC-ROC.`,

    "amazon": `• Led the full lifecycle of a First-Mile pre-bagging pilot, beginning with A/B tests to evaluate operational efficiency, then productionized ELT workflows (S3, Lambda, Airflow, Redshift) to validate pilot results against baselines, measuring package touch count, mis-sorts, and truck fill rate.
• Prototyped and engineered an AI ops assistant using Bedrock and QuickSight Q, integrating prompt engineering and dynamic chart rendering; reduced time-to-insight by 65% for area managers querying labor vs. volume trends, critical pull time, dwell time, and dock-to-stock times.`,

    "icici lombard": `• Engineered a conversational AI agent in TypeScript for MS Teams, integrating with SAP SuccessFactors APIs and securing requests via MSAL to automate HR processes for 5,000+ monthly users; built DeepEval-based testing frameworks to enforce response correctness.
• Productionized a CV model combining CNN-based damage detection from car photos with tabular data to estimate claim amounts for adjuster review, cutting triage time by 32% and improving estimate accuracy by 16%.
• Built a real-time microservice (YOLO/OpenCV + OCR via FastAPI) that extracts license plates from First Notice of Loss uploads and cross-checks with India's VAHAN, improving claim data completeness by 31% and boosting straight-through processing by 67%.
• Shipped fraud-scoring REST APIs on Azure Functions (RF/XGBoost/LogReg) behind Azure API Management with rate limits, OAuth2/JWT, and request validation, reducing manual claim review time by 50%.
• Orchestrated train-to-deploy pipelines in Azure ML using MLflow with GitHub Actions CI/CD gates, PyTest-driven regression tests, shadow releases, auto-rollback, and drift monitoring, reducing model degradation incidents by 40%.
• Architected an OpenAI-based LLM chatbot with RAG architecture using FAISS and custom retrievers evaluated with RAGAS, boosting customer engagement by 5% and reducing query resolution time by 80%.`,

    "cloudfronts": `• Increased sales per customer by 7% and generated $3M in incremental revenue by building a predictive modeling framework in Python using scikit-learn, XGBoost, and rule-based feature engineering pipelines.
• Engineered an anomaly detection microservice using Isolation Forest to identify irregular ERP transaction patterns, improving fraud catch rate by 23% and reducing manual audit effort by 35%.
• Improved churn prediction by ~12% for a major Indian bank by building and deploying an ANN using TensorFlow, Data Lake, and Azure ML.
• Designed customer segmentation using KNN to identify behavioral groups, improving marketing personalization across online shoppers by 30%.
• Served as Designated Responsible Individual (DRI) for production API services, leading a team of 10 engineers in on-call rotations and incident triage.`
  },

  sde: {
    "ancestry": `• Reduced compliance review time by 60% across 100+ repositories by developing an automated auditing tool using GitHub MCP server and an LLM client to detect missing internal headers in inbound/outbound service calls; used consistent hashing to partition repo batches across concurrent workers.
• Accelerating real-time genomic predictions by optimizing a CNN-based classifier using TorchScript (JIT) and ONNX for high-performance inference via FastAPI; designed the async endpoint using Python asyncio to handle burst traffic with non-blocking I/O.`,

    "institutional research": `• Built a WCAG 2.2-compliant full-stack student analytics platform with a React frontend and Node.js/Express REST and GraphQL backend, integrating an LLM-powered natural language query engine for dynamic, client-driven queries across heterogeneous institutional datasets.
• Designed and deployed scalable Spark (Scala) ingestion pipelines using Databricks Jobs, migrating 20+ GB of Census, IRS, and USPS data into ACID tables (Iceberg, later Delta Lake) with schema evolution, powering predictive models for student admission likelihood.`,

    "amazon": `• Engineered a labor-optimization ETL in PostgreSQL on Redshift + Spark to disaggregate shift schedules into hourly load forecasts, improving planning granularity and reducing overstaffing/understaffing at a pilot site over 6 weeks.
• Deployed Trino on AWS EKS via Helm for ad-hoc SQL over First-Mile metrics (Critical Pull Time, package volume), replacing manual Redshift exports.
• Led the full lifecycle of a First-Mile pre-bagging pilot with A/B tests to estimate causal impact on throughput and mis-sort rates, then productionized ELT workflows (S3, Lambda, Airflow, Redshift) to validate pilot results against baselines.
• Developed an AI ops assistant using Bedrock and QuickSight Q with prompt engineering and dynamic chart rendering, reducing time-to-insight by 65% for area managers.`,

    "icici lombard": `• Engineered streaming and batch data services with PySpark and Databricks landing in ADLS across 5+ sources; implemented distributed transactions using saga pattern across Kafka topics, processing approximately 1M records/month and enabling calculation of loss ratio.
• Built real-time vehicle telematics ingestion using Azure Event Hubs (Kafka API) to Azure Cosmos DB with schema evolution; exposed gRPC-based policy recommendation API with consistent hashing for tenant routing, serving 130K+ ICICI mobile app users.
• Shipped fraud-scoring REST APIs on Azure Functions (RF/XGBoost/LogReg) behind Azure API Management with rate limiting, OAuth2/JWT, and API versioning; tracked experiments via MLflow with staged promotion, reducing manual claim review time by 50%.
• Engineered a conversational OpenAI agent in TypeScript for MS Teams using async/await and a thread-pool executor for parallel SAP SuccessFactors API calls, securing requests via MSAL to automate HR processes for 5,000+ monthly users.
• Implemented a low-latency RAG assistant (Azure OpenAI, Function App, Redis) with Elasticsearch-backed hybrid search (BM25 + vector) for policy clarification, processing ~2–3K queries/day and reducing time-to-answer by 80%.`,

    "cloudfronts": `• Developed event-driven Java (Spring Boot) microservices on Azure App Service using RabbitMQ to integrate CRM (Salesforce, Dynamics 365) and ERP (SAP, NAV); exposed REST and GraphQL APIs via Azure API Management and automated Azure DevOps CI/CD with staged slots for zero-downtime releases.
• Accelerated personalization for clients including two Fortune-ranked clients by modeling user interactions in Neo4j, caching recommendations in Redis for sub-100ms API responses, and monitoring via Azure Log Analytics.
• Automated nightly SKU data loads from ERP to CRM using Docker, Kubernetes, and Helm on AKS, 2M+ records/run, reducing runtime by 40%.
• Implemented asynchronous programming patterns in C# services to reduce thread blocking and increase throughput by 25% under peak load.
• Served as Designated Responsible Individual for production data services, leading a team of 10 engineers in on-call rotations, incident triage, and SLA restoration.`
  }
};

async function fillDescriptions(type) {
  const cards = getEmploymentCards();
  let filled = 0;
  let missed = [];

  for (const card of cards) {
    const employer = extractEmployer(card.container);
    const key = Object.keys(descriptions[type]).find(k => employer.includes(k));
    if (!key) {
      if (employer) missed.push(employer);
      continue;
    }
    card.textarea.scrollIntoView({ block: "center" });
    await wait(200);
    setReactValue(card.textarea, descriptions[type][key]);
    filled++;
    await wait(250);
  }

  return { filled, total: cards.length, missed };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fill") {
    fillDescriptions(message.type).then(result => sendResponse(result));
    return true;
  }
});
